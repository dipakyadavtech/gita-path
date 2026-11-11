package app.gitapath.guide.internal;

import app.gitapath.content.ContentQuery;
import app.gitapath.content.Verse;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * Finds the verses most relevant to a question by theme keywords.
 * Production plan (SRS): pgvector embeddings over verses, words and commentary; same interface.
 */
@Component
class Retriever {
    private static final Map<String, List<String>> KEYWORDS = Map.of(
            "stress", List.of("stress", "anxious", "anxiety", "worried", "worry", "scared", "afraid", "fear", "nervous", "pressure", "interview", "presentation"),
            "exams", List.of("exam", "test", "study", "marks", "result"),
            "anger", List.of("angry", "anger", "rage", "irritated", "fight", "argument"),
            "motivation", List.of("lazy", "motivation", "stuck", "procrastinat", "tired", "give up", "no energy"),
            "grief", List.of("loss", "lost", "grief", "died", "death", "miss"),
            "career", List.of("job", "career", "boss", "work", "promotion", "office", "quit"),
            "balance", List.of("balance", "success", "failure", "fail"));

    private final ContentQuery content;

    Retriever(ContentQuery content) {
        this.content = content;
    }

    List<Verse> top(String question, int k) {
        String q = question.toLowerCase(Locale.ROOT);
        Map<String, Integer> score = new HashMap<>();
        List<Verse> all = content.allVerses();
        KEYWORDS.forEach((theme, words) -> {
            int hits = (int) words.stream().filter(q::contains).count();
            if (hits == 0) return;
            all.stream().filter(v -> v.themes().contains(theme)).forEach(v -> score.merge(v.id(), hits, Integer::sum));
        });
        List<Verse> ranked = all.stream().filter(v -> score.containsKey(v.id()))
                .sorted(Comparator.comparing((Verse v) -> score.get(v.id())).reversed()).limit(k).toList();
        if (!ranked.isEmpty()) return ranked;
        return all.stream().filter(v -> v.id().equals("2.47") || v.id().equals("2.48")).toList();
    }
}
