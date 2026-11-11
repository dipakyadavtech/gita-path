package app.gitapath.admin.internal;

import app.gitapath.content.ContentQuery;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints for the React admin portal (W1, W3). Requires ROLE_ADMIN. Content editing itself happens in Strapi. */
@RestController
class AdminController {
    private final JdbcClient db;
    private final ContentQuery content;

    AdminController(JdbcClient db, ContentQuery content) {
        this.db = db;
        this.content = content;
    }

    @GetMapping("/admin/v1/stats")
    Map<String, Object> stats() {
        return Map.of(
                "users", count("select count(*) from users"),
                "versesLive", count("select count(*) from verses"),
                "stepsCompletedToday", count("select count(*) from verse_steps where completed_at::date = current_date"),
                "questionsThisWeek", count("select count(*) from ai_answers where created_at > now() - interval '7 days'"),
                "openFlags", count("select count(*) from ai_answers where flagged and not reviewed"),
                "crisisRepliesThisWeek", count("select count(*) from ai_answers where safety_label = 'crisis' and created_at > now() - interval '7 days'"));
    }

    @GetMapping("/admin/v1/verses")
    List<?> verses() {
        return content.allVerses();
    }

    @GetMapping("/admin/v1/ai/flags")
    List<Map<String, Object>> flags() {
        return db.sql("select id, question, answer, cited::text cited, flag_reason, safety_label, created_at from ai_answers where flagged and not reviewed order by created_at desc limit 100")
                .query().listOfRows();
    }

    @PostMapping("/admin/v1/ai/flags/{id}/resolve")
    ResponseEntity<Void> resolve(@PathVariable UUID id) {
        db.sql("update ai_answers set reviewed = true where id = ?").param(id).update();
        return ResponseEntity.noContent().build();
    }

    private long count(String sql) {
        return db.sql(sql).query(Long.class).single();
    }
}
