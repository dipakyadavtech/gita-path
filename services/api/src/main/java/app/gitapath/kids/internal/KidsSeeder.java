package app.gitapath.kids.internal;

import app.gitapath.shared.Json;
import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import tools.jackson.core.type.TypeReference;

/** Loads the starter kids shlokas (packages/content/data/kids.json) once verses exist. */
@Component
@Order(Ordered.LOWEST_PRECEDENCE)
class KidsSeeder implements ApplicationRunner {
    private final KidsStore store;
    private final KidsController controller;
    private final Json json;

    KidsSeeder(KidsStore store, KidsController controller, Json json) {
        this.store = store;
        this.controller = controller;
        this.json = json;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (store.shlokaCount() > 0) return;
        Map<String, Object> file;
        try (InputStream in = new ClassPathResource("content/kids.json").getInputStream()) {
            file = json.mapper().readValue(in, new TypeReference<Map<String, Object>>() {});
        }
        @SuppressWarnings("unchecked") List<Map<String, Object>> shlokas = (List<Map<String, Object>>) file.get("shlokas");
        for (Map<String, Object> s : shlokas) {
            Map<String, Object> data = new LinkedHashMap<>(s);
            String id = (String) data.remove("id");
            String verseId = (String) data.remove("verseId");
            String title = (String) data.remove("title");
            controller.checkAgainstVerse(verseId, data);
            store.upsertShloka(id, verseId, title, data);
        }
    }
}
