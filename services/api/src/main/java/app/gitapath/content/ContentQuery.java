package app.gitapath.content;

import app.gitapath.shared.Json;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;

/** Public API of the content module: read published verses, chapters, stories and topics. */
@Service
public class ContentQuery {
    public record Chapter(int number, String name, String english, int verseCount) {}
    public record Topic(String id, String title, List<String> verses, List<String> moods) {}

    private final JdbcClient db;
    private final Json json;

    ContentQuery(JdbcClient db, Json json) {
        this.db = db;
        this.json = json;
    }

    private static final String VERSE_COLS = "id, chapter, number, sanskrit::text s, iast, meaning, life_note, words::text w, themes::text t, actions::text a, audio_url";

    public Optional<Verse> verse(String id) {
        return db.sql("select " + VERSE_COLS + " from verses where id = ?").param(id).query((rs, n) -> map(rs)).optional();
    }

    public List<Verse> versesOfChapter(int chapter) {
        return db.sql("select " + VERSE_COLS + " from verses where chapter = ? order by number").param(chapter).query((rs, n) -> map(rs)).list();
    }

    public List<Verse> allVerses() {
        return db.sql("select " + VERSE_COLS + " from verses order by chapter, number").query((rs, n) -> map(rs)).list();
    }

    public List<Chapter> chapters() {
        return db.sql("select number, name, english, verse_count from chapters order by number").query(Chapter.class).list();
    }

    public Optional<Chapter> chapter(int n) {
        return db.sql("select number, name, english, verse_count from chapters where number = ?").param(n).query(Chapter.class).optional();
    }

    public List<Story> stories(boolean kids) {
        return db.sql("select id, season, episode, title, minutes, verse_id, kids_safe, kids, summary, scenes::text sc from stories where kids = ? order by season, episode")
                .param(kids)
                .query((rs, n) -> new Story(rs.getString("id"), rs.getInt("season"), rs.getInt("episode"), rs.getString("title"), rs.getInt("minutes"),
                        rs.getString("verse_id"), rs.getBoolean("kids_safe"), rs.getBoolean("kids"), rs.getString("summary"),
                        rs.getString("sc") == null ? List.of() : json.read(rs.getString("sc"), new TypeReference<List<List<String>>>() {})))
                .list();
    }

    public List<Topic> topics() {
        return db.sql("select id, title, verses::text v, moods::text m from topics order by id")
                .query((rs, n) -> new Topic(rs.getString("id"), rs.getString("title"), json.strings(rs.getString("v")), json.strings(rs.getString("m"))))
                .list();
    }

    private Verse map(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new Verse(rs.getString("id"), rs.getInt("chapter"), rs.getInt("number"), json.strings(rs.getString("s")), rs.getString("iast"),
                rs.getString("meaning"), rs.getString("life_note"),
                json.read(rs.getString("w"), new TypeReference<List<List<String>>>() {}),
                json.strings(rs.getString("t")), json.strings(rs.getString("a")), rs.getString("audio_url"));
    }
}
