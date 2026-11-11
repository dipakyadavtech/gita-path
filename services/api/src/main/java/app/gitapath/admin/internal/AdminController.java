package app.gitapath.admin.internal;

import app.gitapath.content.ContentQuery;
import app.gitapath.content.Verse;
import app.gitapath.shared.ApiException;
import app.gitapath.shared.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints for the React admin portal (apps/admin): W1 content library, W2 verse review, W3 AI review.
 * Requires ROLE_ADMIN. Content is written in Strapi (services/cms) and arrives through the CMS sync.
 */
@RestController
class AdminController {
    record Resolve(@Pattern(regexp = "dismissed|confirmed") String action, @Size(max = 1000) String note) {}

    private final JdbcClient db;
    private final ContentQuery content;

    AdminController(JdbcClient db, ContentQuery content) {
        this.db = db;
        this.content = content;
    }

    @GetMapping("/admin/v1/stats")
    Map<String, Object> stats() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("users", count("select count(*) from users"));
        m.put("versesLive", count("select count(*) from verses"));
        m.put("chaptersWithVerses", count("select count(distinct chapter) from verses"));
        m.put("storiesLive", count("select count(*) from stories"));
        m.put("stepsCompletedToday", count("select count(*) from verse_steps where completed_at::date = current_date"));
        m.put("questionsThisWeek", count("select count(*) from ai_answers where created_at > now() - interval '7 days'"));
        m.put("openFlags", count("select count(*) from ai_answers where flagged and not reviewed"));
        m.put("resolvedFlagsThisWeek", count("select count(*) from ai_answers where reviewed and reviewed_at > now() - interval '7 days'"));
        m.put("crisisRepliesThisWeek", count("select count(*) from ai_answers where safety_label = 'crisis' and created_at > now() - interval '7 days'"));
        return m;
    }

    /** W1: every live verse with its Sanskrit checksum and last sync time. */
    @GetMapping("/admin/v1/verses")
    List<Map<String, Object>> verses() {
        Map<String, Map<String, Object>> meta = new LinkedHashMap<>();
        db.sql("select id, checksum, updated_at from verses").query().listOfRows().forEach(r -> meta.put((String) r.get("id"), r));
        return content.allVerses().stream().map(v -> withMeta(v, meta.get(v.id()))).toList();
    }

    /** W2: one verse for review. */
    @GetMapping("/admin/v1/verses/{id}")
    Map<String, Object> verse(@PathVariable String id) {
        Verse v = content.verse(id).orElseThrow(() -> ApiException.notFound("Verse " + id + " not found"));
        Map<String, Object> meta = db.sql("select checksum, updated_at from verses where id = ?").param(id).query().singleRow();
        return withMeta(v, meta);
    }

    /** W3: flagged answers. status = open (default), resolved or all. */
    @GetMapping("/admin/v1/ai/flags")
    List<Map<String, Object>> flags(@RequestParam(defaultValue = "open") String status) {
        String where = switch (status) {
            case "resolved" -> "flagged and reviewed";
            case "all" -> "flagged";
            default -> "flagged and not reviewed";
        };
        return db.sql("""
                select id, question, answer, cited::text cited, flag_reason, safety_label, created_at,
                       reviewed, review_action, review_note, reviewed_by, reviewed_at
                from ai_answers where %s order by created_at desc limit 200""".formatted(where))
                .query().listOfRows();
    }

    @PostMapping("/admin/v1/ai/flags/{id}/resolve")
    ResponseEntity<Void> resolve(@PathVariable UUID id, @Valid @RequestBody(required = false) Resolve body) {
        String action = body == null || body.action() == null ? "dismissed" : body.action();
        int n = db.sql("""
                update ai_answers set reviewed = true, review_action = ?, review_note = ?, reviewed_by = ?, reviewed_at = now()
                where id = ? and flagged""")
                .params(action, body == null ? null : body.note(), CurrentUser.id(), id).update();
        if (n == 0) throw ApiException.notFound("Flagged answer not found");
        return ResponseEntity.noContent().build();
    }

    private static Map<String, Object> withMeta(Verse v, Map<String, Object> meta) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("verse", v);
        m.put("checksum", meta == null ? null : meta.get("checksum"));
        m.put("updatedAt", meta == null ? null : meta.get("updated_at"));
        return m;
    }

    private long count(String sql) {
        return db.sql(sql).query(Long.class).single();
    }
}
