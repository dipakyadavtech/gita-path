package app.gitapath.guide.internal;

import app.gitapath.billing.Entitlements;
import app.gitapath.content.ContentQuery;
import app.gitapath.content.Verse;
import app.gitapath.guide.SafetyClassifier;
import app.gitapath.shared.ApiException;
import app.gitapath.shared.AppProperties;
import app.gitapath.shared.Json;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

@Service
class GuideService {
    record Answer(String kind, UUID id, String text, List<String> verses, String action) {
        static Answer safety(UUID id) {
            return new Answer("safety", id, null, List.of(), null);
        }
    }

    private static final Pattern VERSE_REF = Pattern.compile("\\b(\\d{1,2}\\.\\d{1,2})\\b");
    private static final Pattern DEVANAGARI_RUN = Pattern.compile("[\\u0900-\\u097F][\\u0900-\\u097F\\s]{6,}");

    private final Retriever retriever;
    private final LlmClient llm;
    private final ContentQuery content;
    private final Entitlements entitlements;
    private final AppProperties props;
    private final JdbcClient db;
    private final Json json;

    GuideService(Retriever retriever, LlmClient llm, ContentQuery content, Entitlements entitlements, AppProperties props, JdbcClient db, Json json) {
        this.retriever = retriever;
        this.llm = llm;
        this.content = content;
        this.entitlements = entitlements;
        this.props = props;
        this.db = db;
        this.json = json;
    }

    Answer ask(String userId, String question) {
        UUID id = UUID.randomUUID();
        if (SafetyClassifier.isCrisis(question)) {
            store(id, userId, question, null, List.of(), "crisis");
            return Answer.safety(id);
        }
        if (!entitlements.isPlus(userId) && askedToday(userId) >= props.guide().freeDailyQuestions()) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "E-429", "Free accounts get " + props.guide().freeDailyQuestions() + " questions a day");
        }
        List<Verse> verses = retriever.top(question, 3);
        Verse main = verses.getFirst();
        String text = llm.answer(question, verses).map(t -> verify(t, verses)).orElseGet(() ->
                "What you are feeling is very human, and Krishna speaks to it directly. " + main.meaning() + " In everyday terms: " + main.lifeNote());
        String action = extractAction(text).orElse(main.actions().getFirst());
        String body = text.replaceAll("(?im)^\\s*try today:.*$", "").trim();
        List<String> cited = cited(body, verses);
        store(id, userId, question, body, cited, "ok");
        return new Answer("answer", id, body, cited, action);
    }

    void flag(String userId, UUID id, String reason) {
        int n = db.sql("update ai_answers set flagged = true, flag_reason = ? where id = ? and user_id = ?").params(reason, id, userId).update();
        if (n == 0) throw ApiException.notFound("Answer");
    }

    /** FR-AI-03 quote check: drop any line quoting Devanagari that is not in the provided verses. */
    static String verify(String text, List<Verse> verses) {
        Set<String> allowed = verses.stream().flatMap(v -> v.sanskrit().stream()).map(GuideService::squash).collect(Collectors.toSet());
        return text.lines().filter(line -> {
            Matcher m = DEVANAGARI_RUN.matcher(line);
            while (m.find()) {
                String q = squash(m.group());
                if (allowed.stream().noneMatch(a -> a.contains(q))) return false;
            }
            return true;
        }).collect(Collectors.joining("\n"));
    }

    private List<String> cited(String text, List<Verse> verses) {
        Set<String> retrieved = verses.stream().map(Verse::id).collect(Collectors.toSet());
        List<String> refs = VERSE_REF.matcher(text).results().map(r -> r.group(1)).filter(retrieved::contains).distinct().toList();
        List<String> out = refs.isEmpty() ? verses.stream().limit(2).map(Verse::id).toList() : refs;
        return out.stream().filter(v -> content.verse(v).isPresent()).toList();
    }

    private static java.util.Optional<String> extractAction(String text) {
        return text.lines().filter(l -> l.trim().toLowerCase().startsWith("try today:")).findFirst().map(l -> l.trim().substring("try today:".length()).trim());
    }

    private static String squash(String s) {
        return s.replaceAll("[\\s।॥]", "");
    }

    private int askedToday(String userId) {
        return db.sql("select count(*) from ai_answers where user_id = ? and asked_on = current_date and safety_label = 'ok'").param(userId).query(Integer.class).single();
    }

    private void store(UUID id, String userId, String q, String a, List<String> cited, String label) {
        db.sql("insert into ai_answers (id, user_id, question, answer, cited, safety_label) values (?, ?, ?, ?, cast(? as jsonb), ?)")
                .params(id, userId, q, a, json.write(cited), label).update();
    }
}
