package app.gitapath.identity.internal;

import app.gitapath.identity.UserDeleted;
import app.gitapath.identity.UserDirectory;
import app.gitapath.shared.ApiException;
import app.gitapath.shared.CurrentUser;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Profile, data export (FR-PR-02) and account deletion. */
@RestController
class MeController {
    private final UserDirectory users;
    private final JdbcClient db;
    private final ApplicationEventPublisher events;

    MeController(UserDirectory users, JdbcClient db, ApplicationEventPublisher events) {
        this.users = users;
        this.db = db;
        this.events = events;
    }

    @GetMapping("/v1/me")
    UserDirectory.User me() {
        return users.find(CurrentUser.id()).orElseThrow(() -> ApiException.notFound("User"));
    }

    @GetMapping("/v1/me/export")
    Map<String, Object> export() {
        String id = CurrentUser.id();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("user", me());
        out.put("steps", db.sql("select * from verse_steps where user_id = ?").param(id).query().listOfRows());
        out.put("streak", db.sql("select * from streaks where user_id = ?").param(id).query().listOfRows());
        out.put("questions", db.sql("select asked_on, question, answer, cited from ai_answers where user_id = ?").param(id).query().listOfRows());
        out.put("circles", db.sql("select circle_id, status, joined_at from circle_members where user_id = ?").param(id).query().listOfRows());
        return out;
    }

    @DeleteMapping("/v1/me")
    @Transactional
    ResponseEntity<Void> delete() {
        String id = CurrentUser.id();
        db.sql("delete from users where id = ?").param(id).update();
        events.publishEvent(new UserDeleted(id));
        return ResponseEntity.noContent().build();
    }
}
