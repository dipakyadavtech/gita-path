package app.gitapath.billing;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

/** Public API of billing: which plan a user is on (free or plus). FR-PY-03: free never loses the core. */
@Service
public class Entitlements {
    private final JdbcClient db;

    Entitlements(JdbcClient db) {
        this.db = db;
    }

    public String plan(String userId) {
        return db.sql("select plan from entitlements where user_id = ?").param(userId).query(String.class).optional().orElse("free");
    }

    public boolean isPlus(String userId) {
        return "plus".equals(plan(userId));
    }

    public void set(String userId, String plan, String source) {
        db.sql("insert into entitlements (user_id, plan, source, updated_at) values (?, ?, ?, now()) on conflict (user_id) do update set plan = excluded.plan, source = excluded.source, updated_at = now()")
                .params(userId, plan, source).update();
    }
}
