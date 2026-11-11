package app.gitapath.guide.internal;

import app.gitapath.content.Verse;
import app.gitapath.shared.AppProperties;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;

/**
 * Optional LLM for Ask the Gita, via any OpenAI-compatible /chat/completions endpoint.
 * The model only sees the retrieved verses and is told to use nothing else (FR-AI-03).
 */
@Component
class LlmClient {
    private static final Logger log = LoggerFactory.getLogger(LlmClient.class);
    static final String SYSTEM = """
            You are the guide inside Gita Path, an app for learning the Bhagavad Gita.
            Answer the user's question warmly in under 120 words, in plain language, using ONLY the verses provided.
            Never invent or quote verses that are not provided. Refer to verses by their number, e.g. "verse 2.47".
            Never speak as Krishna in the first person. No medical, legal, financial, caste, political or sectarian advice.
            End with one small action the user can take today, on its own line starting with "Try today:".
            """;

    private final AppProperties props;
    private final RestClient http = RestClient.create();

    LlmClient(AppProperties props) {
        this.props = props;
    }

    boolean enabled() {
        var g = props.guide();
        return g.llmUrl() != null && !g.llmUrl().isBlank() && g.llmKey() != null && !g.llmKey().isBlank();
    }

    Optional<String> answer(String question, List<Verse> verses) {
        if (!enabled()) return Optional.empty();
        String context = verses.stream()
                .map(v -> "Verse " + v.id() + ": " + String.join(" ", v.sanskrit()) + "\nMeaning: " + v.meaning() + "\nIn life: " + v.lifeNote())
                .collect(Collectors.joining("\n\n"));
        var body = Map.of(
                "model", props.guide().llmModel(),
                "temperature", 0.3,
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM),
                        Map.of("role", "user", "content", "Verses:\n" + context + "\n\nQuestion: " + question)));
        try {
            JsonNode res = http.post().uri(props.guide().llmUrl())
                    .header("Authorization", "Bearer " + props.guide().llmKey())
                    .contentType(MediaType.APPLICATION_JSON).body(body).retrieve().body(JsonNode.class);
            return Optional.ofNullable(res).map(r -> r.path("choices").path(0).path("message").path("content").asString()).filter(s -> !s.isBlank());
        } catch (RuntimeException e) {
            log.warn("LLM call failed, falling back to template answer: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
