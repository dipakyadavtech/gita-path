package app.gitapath.kids.internal;

import app.gitapath.shared.ApiException;
import app.gitapath.shared.Json;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import tools.jackson.core.type.TypeReference;

@Component
class KidsStore {
    record Profile(UUID id, String name, int age, String avatar) {}
    record Progress(String kind, String itemId, int stars, int times) {}
    record Settings(int dailyLimitMin, boolean bedtimeOn, String bedtimeStart, String bedtimeEnd,
                    boolean chantGate, String narration, String strictness) {
        static Settings defaults() {
            return new Settings(15, true, "19:30", "07:00", true, "hi+en", "gentle");
        }
    }

    private final JdbcClient db;
    private final Json json;

    KidsStore(JdbcClient db, Json json) {
        this.db = db;
        this.json = json;
    }

    // ---- shlokas ----------------------------------------------------------
    long shlokaCount() {
        return db.sql("select count(*) from kid_shlokas").query(Long.class).single();
    }

    void upsertShloka(String id, String verseId, String title, Map<String, Object> data) {
        db.sql("""
                insert into kid_shlokas (id, verse_id, title, data) values (?, ?, ?, cast(? as jsonb))
                on conflict (id) do update set verse_id = excluded.verse_id, title = excluded.title,
                  data = excluded.data, updated_at = now()""")
                .params(id, verseId, title, json.write(data)).update();
    }

    List<Map<String, Object>> shlokas() {
        return db.sql("select id, verse_id, title, data::text data from kid_shlokas order by id").query()
                .listOfRows().stream().map(r -> {
                    Map<String, Object> m = json.read((String) r.get("data"), new TypeReference<Map<String, Object>>() {});
                    m.put("id", r.get("id"));
                    m.put("verseId", r.get("verse_id"));
                    m.put("title", r.get("title"));
                    return m;
                }).toList();
    }

    // ---- profiles ---------------------------------------------------------
    List<Profile> profiles(String parentId) {
        return db.sql("select id, name, age, avatar from kid_profiles where parent_id = ? order by created_at")
                .param(parentId).query(Profile.class).list();
    }

    int profileCount(String parentId) {
        return db.sql("select count(*) from kid_profiles where parent_id = ?").param(parentId).query(Integer.class).single();
    }

    /** Creates or updates a profile. The id comes from the device so offline-created profiles keep their id. */
    void saveProfile(String parentId, Profile p) {
        int n = db.sql("""
                insert into kid_profiles (id, parent_id, name, age, avatar) values (?, ?, ?, ?, ?)
                on conflict (id) do update set name = excluded.name, age = excluded.age, avatar = excluded.avatar
                where kid_profiles.parent_id = excluded.parent_id""")
                .params(p.id(), parentId, p.name(), p.age(), p.avatar()).update();
        if (n == 0) throw ApiException.forbidden("This profile belongs to another family");
    }

    void requireOwner(String parentId, UUID kidId) {
        String owner = db.sql("select parent_id from kid_profiles where id = ?").param(kidId).query(String.class).optional()
                .orElseThrow(() -> ApiException.notFound("Kid profile"));
        if (!owner.equals(parentId)) throw ApiException.notFound("Kid profile");
    }

    void deleteProfile(UUID kidId) {
        db.sql("delete from kid_profiles where id = ?").param(kidId).update();
    }

    // ---- progress ---------------------------------------------------------
    void record(UUID kidId, String kind, String itemId, int stars) {
        db.sql("""
                insert into kid_progress (kid_id, kind, item_id, stars) values (?, ?, ?, ?)
                on conflict (kid_id, kind, item_id) do update set times = kid_progress.times + 1,
                  stars = greatest(kid_progress.stars, excluded.stars), last_at = now()""")
                .params(kidId, kind, itemId, stars).update();
    }

    List<Progress> progress(UUID kidId) {
        return db.sql("select kind, item_id, stars, times from kid_progress where kid_id = ? order by first_at")
                .param(kidId).query(Progress.class).list();
    }

    // ---- settings ---------------------------------------------------------
    Settings settings(String parentId) {
        return db.sql("""
                select daily_limit_min, bedtime_on, bedtime_start, bedtime_end, chant_gate, narration, strictness
                from kid_settings where parent_id = ?""").param(parentId).query(Settings.class).optional()
                .orElse(Settings.defaults());
    }

    void saveSettings(String parentId, Settings s) {
        db.sql("""
                insert into kid_settings (parent_id, daily_limit_min, bedtime_on, bedtime_start, bedtime_end, chant_gate, narration, strictness)
                values (?, ?, ?, ?, ?, ?, ?, ?)
                on conflict (parent_id) do update set daily_limit_min = excluded.daily_limit_min, bedtime_on = excluded.bedtime_on,
                  bedtime_start = excluded.bedtime_start, bedtime_end = excluded.bedtime_end, chant_gate = excluded.chant_gate,
                  narration = excluded.narration, strictness = excluded.strictness, updated_at = now()""")
                .params(parentId, s.dailyLimitMin(), s.bedtimeOn(), s.bedtimeStart(), s.bedtimeEnd(), s.chantGate(), s.narration(), s.strictness())
                .update();
    }
}
