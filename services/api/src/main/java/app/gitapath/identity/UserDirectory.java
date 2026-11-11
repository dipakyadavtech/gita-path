package app.gitapath.identity;

import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

/** Public API of the identity module: who users are. */
@Service
public class UserDirectory {
    public record User(String id, String name, String phone) {}

    private final JdbcClient db;

    UserDirectory(JdbcClient db) {
        this.db = db;
    }

    /** Creates the user row on first sight (sign-in happens in Clerk or the dev token endpoint). */
    public void ensure(String id, String name) {
        db.sql("insert into users (id, name) values (?, ?) on conflict (id) do nothing").params(id, name).update();
    }

    public Optional<User> find(String id) {
        return db.sql("select id, name, phone from users where id = ?").param(id).query(User.class).optional();
    }

    public String nameOf(String id) {
        return find(id).map(User::name).orElse("Friend");
    }
}
