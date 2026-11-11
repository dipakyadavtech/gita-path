package app.gitapath.content.internal;

import app.gitapath.content.ContentQuery;
import app.gitapath.content.Story;
import app.gitapath.content.Verse;
import app.gitapath.shared.ApiException;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
class ContentController {
    private final ContentQuery content;

    ContentController(ContentQuery content) {
        this.content = content;
    }

    @GetMapping("/v1/verses/{id}")
    Verse verse(@PathVariable String id) {
        return content.verse(id).orElseThrow(() -> ApiException.notFound("Verse " + id));
    }

    @GetMapping("/v1/chapters")
    List<ContentQuery.Chapter> chapters() {
        return content.chapters();
    }

    @GetMapping("/v1/chapters/{n}/verses")
    List<Verse> chapterVerses(@PathVariable int n) {
        return content.versesOfChapter(n);
    }

    @GetMapping("/v1/stories")
    List<Story> stories(@RequestParam(defaultValue = "false") boolean kids) {
        return content.stories(kids);
    }

    @GetMapping("/v1/topics")
    List<ContentQuery.Topic> topics() {
        return content.topics();
    }

    /** FR-SR-01: search verses, stories and topics; diacritics are ignored so "karmany" finds "karmaṇy". */
    @GetMapping("/v1/search")
    Map<String, Object> search(@RequestParam String q) {
        String n = norm(q);
        if (n.isBlank()) return Map.of("verses", List.of(), "stories", List.of(), "topics", List.of());
        List<Verse> verses = content.allVerses().stream()
                .filter(v -> norm(String.join(" ", v.id(), v.meaning(), v.lifeNote(), v.iast(), String.join(" ", v.themes()), String.join(" ", v.sanskrit()))).contains(n))
                .toList();
        List<Story> stories = content.stories(false).stream().filter(s -> norm(s.title()).contains(n)).toList();
        List<ContentQuery.Topic> topics = content.topics().stream()
                .filter(t -> norm(t.title()).contains(n) || t.id().contains(n) || t.moods().stream().anyMatch(m -> norm(m).contains(n)))
                .toList();
        return Map.of("verses", verses, "stories", stories, "topics", topics);
    }

    static String norm(String s) {
        return Normalizer.normalize(s.toLowerCase(Locale.ROOT), Normalizer.Form.NFD).replaceAll("\\p{M}", "").trim();
    }
}
