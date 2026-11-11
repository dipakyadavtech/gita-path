package app.gitapath;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.modulith.test.EnableScenarios;
import org.springframework.test.web.servlet.MockMvc;

/**
 * End-to-end API flows against a real PostgreSQL (DATABASE_URL, default jdbc:postgresql://localhost:5432/gitapath_test).
 * Run scripts/test-api.sh, which recreates the test database first.
 */
@SpringBootTest(properties = "spring.datasource.url=${TEST_DATABASE_URL:jdbc:postgresql://localhost:5432/gitapath_test}")
@AutoConfigureMockMvc
@EnableScenarios
class ApiFlowTests {
    @Autowired MockMvc mvc;

    String token(String phone, boolean admin) throws Exception {
        String body = mvc.perform(post("/v1/auth/dev-token").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"phone\":\"" + phone + "\",\"otp\":\"123456\",\"name\":\"Priya\",\"admin\":" + admin + "}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return "Bearer " + JsonPath.read(body, "$.token");
    }

    @Test
    void wrongOtpIsRejected() throws Exception {
        mvc.perform(post("/v1/auth/dev-token").contentType(MediaType.APPLICATION_JSON).content("{\"phone\":\"9876500000\",\"otp\":\"000000\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("E-400"));
    }

    @Test
    void contentIsPublic() throws Exception {
        mvc.perform(get("/v1/verses/2.47")).andExpect(status().isOk()).andExpect(jsonPath("$.sanskrit[0]").exists());
        mvc.perform(get("/v1/search").param("q", "karmany")).andExpect(status().isOk()).andExpect(jsonPath("$.verses[0].id").value("2.47"));
    }

    @Test
    void dailyLoopAndStreak() throws Exception {
        String t = token("9876500001", false);
        mvc.perform(get("/v1/today").header("Authorization", t)).andExpect(status().isOk()).andExpect(jsonPath("$.verse.id").exists());
        mvc.perform(post("/v1/progress/2.47/complete").header("Authorization", t)).andExpect(status().isOk())
                .andExpect(jsonPath("$.streak.current").value(1)).andExpect(jsonPath("$.increased").value(true));
        mvc.perform(post("/v1/progress/2.47/complete").header("Authorization", t)).andExpect(status().isOk())
                .andExpect(jsonPath("$.streak.current").value(1)).andExpect(jsonPath("$.increased").value(false));
    }

    @Test
    void crisisQuestionGetsFixedSafetyReply() throws Exception {
        String t = token("9876500002", false);
        mvc.perform(post("/v1/ask").header("Authorization", t).contentType(MediaType.APPLICATION_JSON).content("{\"question\":\"I feel hopeless and can't go on\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.kind").value("safety")).andExpect(jsonPath("$.text").doesNotExist());
    }

    @Test
    void answersCiteVersesAndFreeLimitApplies() throws Exception {
        String t = token("9876500003", false);
        for (int i = 0; i < 5; i++) {
            mvc.perform(post("/v1/ask").header("Authorization", t).contentType(MediaType.APPLICATION_JSON).content("{\"question\":\"I am scared of my interview\"}"))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.verses[0]").exists());
        }
        mvc.perform(post("/v1/ask").header("Authorization", t).contentType(MediaType.APPLICATION_JSON).content("{\"question\":\"one more\"}"))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void circleJoinNeedsOwnerApproval() throws Exception {
        String owner = token("9876500004", false);
        String body = mvc.perform(post("/v1/circles").header("Authorization", owner).contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Sharma Family\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String code = JsonPath.read(body, "$.code");
        String guest = token("9876500005", false);
        mvc.perform(get("/v1/circles/join/" + code).header("Authorization", guest)).andExpect(jsonPath("$.name").value("Sharma Family"));
        mvc.perform(post("/v1/circles/join/" + code).header("Authorization", guest)).andExpect(status().isAccepted());
        mvc.perform(get("/v1/circles/mine").header("Authorization", guest)).andExpect(status().isNotFound());
        mvc.perform(post("/v1/circles/mine/members/dev-9876500005/approve").header("Authorization", owner))
                .andExpect(status().isOk()).andExpect(jsonPath("$.members.length()").value(2));
    }

    @Test
    void adminEndpointsNeedAdminRole() throws Exception {
        mvc.perform(get("/admin/v1/stats").header("Authorization", token("9876500006", false))).andExpect(status().isForbidden());
        mvc.perform(get("/admin/v1/stats").header("Authorization", token("9876500007", true))).andExpect(status().isOk()).andExpect(jsonPath("$.versesLive").exists());
    }

    @Test
    void cmsWebhookRejectsUnapprovedSanskritChange() throws Exception {
        String verse = "{\"verse\":{\"id\":\"2.47\",\"chapter\":2,\"number\":47,\"sanskrit\":[\"changed\"],\"iast\":\"x\",\"meaning\":\"m\",\"lifeNote\":\"l\",\"words\":[],\"themes\":[],\"actions\":[\"a\"]}}";
        mvc.perform(post("/internal/content/verses").header("X-Webhook-Secret", "wrong").contentType(MediaType.APPLICATION_JSON).content(verse)).andExpect(status().isForbidden());
        mvc.perform(post("/internal/content/verses").header("X-Webhook-Secret", "dev-cms-secret").contentType(MediaType.APPLICATION_JSON).content(verse)).andExpect(status().isConflict());
    }

    @Test
    void flaggedAnswerIsReviewedByAdmin() throws Exception {
        String user = token("9876500010", false);
        String body = mvc.perform(post("/v1/ask").header("Authorization", user).contentType(MediaType.APPLICATION_JSON).content("{\"question\":\"How do I handle stress at work?\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(body, "$.id");
        mvc.perform(post("/v1/ask/" + id + "/flag").header("Authorization", user).contentType(MediaType.APPLICATION_JSON).content("{\"reason\":\"Wrong verse\"}"))
                .andExpect(status().is2xxSuccessful());

        String admin = token("9876500011", true);
        mvc.perform(get("/admin/v1/ai/flags").header("Authorization", admin))
                .andExpect(status().isOk()).andExpect(jsonPath("$[?(@.id == '" + id + "')].flag_reason").value("Wrong verse"));
        mvc.perform(post("/admin/v1/ai/flags/" + id + "/resolve").header("Authorization", admin).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"action\":\"confirmed\",\"note\":\"Cite 2.47 instead\"}"))
                .andExpect(status().isNoContent());
        mvc.perform(get("/admin/v1/ai/flags?status=resolved").header("Authorization", admin))
                .andExpect(jsonPath("$[?(@.id == '" + id + "')].review_action").value("confirmed"))
                .andExpect(jsonPath("$[?(@.id == '" + id + "')].reviewed_by").value("dev-9876500011"));
        mvc.perform(get("/admin/v1/verses/2.47").header("Authorization", admin))
                .andExpect(status().isOk()).andExpect(jsonPath("$.verse.id").value("2.47")).andExpect(jsonPath("$.checksum").isNotEmpty());
    }
}
