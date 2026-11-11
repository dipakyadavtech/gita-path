package app.gitapath.content.internal;

import app.gitapath.content.Story;
import app.gitapath.content.Verse;
import app.gitapath.shared.Json;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

/** Writes content rows. Only the seeder and the CMS sync use it. */
@Component
class ContentStore {
    private final JdbcClient db;
    private final Json json;

    ContentStore(JdbcClient db, Json json) {
        this.db = db;
        this.json = json;
    }

    static String checksum(List<String> sanskrit) {
        try {
            byte[] h = MessageDigest.getInstance("SHA-256").digest(String.join("\n", sanskrit).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(h);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    Optional<String> existingChecksum(String id) {
        return db.sql("select checksum from verses where id = ?").param(id).query(String.class).optional();
    }

    void upsertVerse(Verse v) {
        db.sql("""
                insert into verses (id, chapter, number, sanskrit, iast, meaning, life_note, words, themes, actions, checksum, updated_at)
                values (:id, :chapter, :number, cast(:sanskrit as jsonb), :iast, :meaning, :lifeNote, cast(:words as jsonb), cast(:themes as jsonb), cast(:actions as jsonb), :checksum, now())
                on conflict (id) do update set chapter = excluded.chapter, number = excluded.number, sanskrit = excluded.sanskrit,
                  iast = excluded.iast, meaning = excluded.meaning, life_note = excluded.life_note, words = excluded.words,
                  themes = excluded.themes, actions = excluded.actions, checksum = excluded.checksum, updated_at = now()
                """)
                .param("id", v.id()).param("chapter", v.chapter()).param("number", v.number())
                .param("sanskrit", json.write(v.sanskrit())).param("iast", v.iast()).param("meaning", v.meaning())
                .param("lifeNote", v.lifeNote()).param("words", json.write(v.words())).param("themes", json.write(v.themes()))
                .param("actions", json.write(v.actions())).param("checksum", checksum(v.sanskrit()))
                .update();
    }

    void upsertStory(Story s) {
        db.sql("""
                insert into stories (id, season, episode, title, minutes, verse_id, kids_safe, kids, summary, scenes)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?, cast(? as jsonb))
                on conflict (id) do update set season = excluded.season, episode = excluded.episode, title = excluded.title,
                  minutes = excluded.minutes, verse_id = excluded.verse_id, kids_safe = excluded.kids_safe, kids = excluded.kids,
                  summary = excluded.summary, scenes = excluded.scenes
                """)
                .params(s.id(), s.season(), s.episode(), s.title(), s.minutes(), s.verseId(), Boolean.TRUE.equals(s.kidsSafe()), Boolean.TRUE.equals(s.kids()), s.summary(),
                        s.scenes() == null ? null : json.write(s.scenes()))
                .update();
    }

    void upsertChapter(int number, String name, String english, int verseCount) {
        db.sql("insert into chapters values (?, ?, ?, ?) on conflict (number) do update set name = excluded.name, english = excluded.english, verse_count = excluded.verse_count")
                .params(number, name, english, verseCount).update();
    }

    void upsertTopic(String id, String title, List<String> verses, List<String> moods) {
        db.sql("insert into topics values (?, ?, cast(? as jsonb), cast(? as jsonb)) on conflict (id) do update set title = excluded.title, verses = excluded.verses, moods = excluded.moods")
                .params(id, title, json.write(verses), json.write(moods)).update();
    }

    long verseCount() {
        return db.sql("select count(*) from verses").query(Long.class).single();
    }
}
