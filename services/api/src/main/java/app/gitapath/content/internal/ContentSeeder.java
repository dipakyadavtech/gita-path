package app.gitapath.content.internal;

import app.gitapath.content.Story;
import app.gitapath.content.Verse;
import app.gitapath.shared.Json;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;

/** Loads the starter content (packages/content/data) into an empty database. */
@Component
@Order(1) // before other modules' seeders that depend on verses
class ContentSeeder implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(ContentSeeder.class);
    private final ContentStore store;
    private final Json json;

    ContentSeeder(ContentStore store, Json json) {
        this.store = store;
        this.json = json;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws IOException {
        if (store.verseCount() > 0) return;
        for (Map<String, Object> c : read("chapters.json", new TypeReference<List<Map<String, Object>>>() {})) {
            store.upsertChapter((Integer) c.get("number"), (String) c.get("name"), (String) c.get("english"), (Integer) c.get("verseCount"));
        }
        List<Verse> verses = read("verses.json", new TypeReference<List<Verse>>() {});
        verses.forEach(store::upsertVerse);
        read("stories.json", new TypeReference<List<Story>>() {}).forEach(store::upsertStory);
        for (Map<String, Object> t : read("topics.json", new TypeReference<List<Map<String, Object>>>() {})) {
            @SuppressWarnings("unchecked") List<String> v = (List<String>) t.get("verses");
            @SuppressWarnings("unchecked") List<String> m = (List<String>) t.get("moods");
            store.upsertTopic((String) t.get("id"), (String) t.get("title"), v, m);
        }
        log.info("Seeded {} verses from the starter content", verses.size());
    }

    private <T> T read(String file, TypeReference<T> type) throws IOException {
        try (InputStream in = new ClassPathResource("content/" + file).getInputStream()) {
            return json.mapper().readValue(in, type);
        }
    }
}
