package app.gitapath.learning.internal;

import app.gitapath.content.ContentQuery;
import app.gitapath.content.Verse;
import app.gitapath.learning.StreakRules;
import app.gitapath.learning.VerseStepCompleted;
import app.gitapath.shared.ApiException;
import java.sql.Date;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class LearningService {
    record Step(String verseId, boolean listened, boolean understood, boolean actionDone, int chantCount, String actionCheckIn, OffsetDateTime completedAt) {}
    record Today(Verse verse, String action, Step step, StreakRules.Streak streak, int done, int total) {}
    record PathNode(String verseId, int number, String state) {}
    record Path(ContentQuery.Chapter chapter, List<PathNode> nodes, int done) {}
    record StepUpdate(Boolean listened, Boolean understood, Boolean actionDone, Integer chantCount, String actionCheckIn) {}
    record Completed(StreakRules.Streak streak, boolean increased) {}

    private final JdbcClient db;
    private final ContentQuery content;
    private final ApplicationEventPublisher events;

    LearningService(JdbcClient db, ContentQuery content, ApplicationEventPublisher events) {
        this.db = db;
        this.content = content;
        this.events = events;
    }

    Map<String, Step> steps(String userId) {
        return db.sql("select verse_id, listened, understood, action_done, chant_count, action_check_in, completed_at from verse_steps where user_id = ?")
                .param(userId).query(Step.class).list().stream().collect(Collectors.toMap(Step::verseId, s -> s));
    }

    StreakRules.Streak streak(String userId) {
        return db.sql("select current, longest, last_date, freezes from streaks where user_id = ?").param(userId)
                .query((rs, n) -> new StreakRules.Streak(rs.getInt(1), rs.getInt(2), rs.getDate(3) == null ? null : rs.getDate(3).toLocalDate(), rs.getInt(4)))
                .optional().orElse(new StreakRules.Streak(0, 0, null, 1));
    }

    /** FR-HM-01: the verse of the day is the first verse on the path the user has not completed. */
    Today today(String userId, ZoneId zone) {
        Map<String, Step> steps = steps(userId);
        List<Verse> path = content.versesOfChapter(2);
        if (path.isEmpty()) throw ApiException.notFound("Path content");
        Verse v = path.stream().filter(x -> steps.get(x.id()) == null || steps.get(x.id()).completedAt() == null).findFirst().orElse(path.getLast());
        LocalDate day = LocalDate.now(zone);
        String action = v.actions().get(day.getDayOfMonth() % v.actions().size());
        int done = (int) steps.values().stream().filter(s -> s.completedAt() != null).count();
        int total = content.chapter(2).map(ContentQuery.Chapter::verseCount).orElse(path.size());
        return new Today(v, action, steps.get(v.id()), streak(userId), done, total);
    }

    Path path(String userId, int chapter) {
        Map<String, Step> steps = steps(userId);
        var ch = content.chapter(chapter).orElseThrow(() -> ApiException.notFound("Chapter " + chapter));
        boolean currentAssigned = false;
        List<PathNode> nodes = new java.util.ArrayList<>();
        int done = 0;
        for (Verse v : content.versesOfChapter(chapter)) {
            Step s = steps.get(v.id());
            String state;
            if (s != null && s.completedAt() != null) { state = "done"; done++; }
            else if (!currentAssigned) { state = "current"; currentAssigned = true; }
            else state = "locked";
            nodes.add(new PathNode(v.id(), v.number(), state));
        }
        return new Path(ch, nodes, done);
    }

    @Transactional
    Step update(String userId, String verseId, StepUpdate u) {
        content.verse(verseId).orElseThrow(() -> ApiException.notFound("Verse " + verseId));
        if (u.chantCount() != null && (u.chantCount() < 0 || u.chantCount() > 1008)) throw ApiException.badRequest("chantCount must be between 0 and 1008");
        db.sql("""
                insert into verse_steps (user_id, verse_id, listened, understood, action_done, chant_count, action_check_in)
                values (:u, :v, coalesce(:l, false), coalesce(:un, false), coalesce(:a, false), coalesce(:c, 0), :ci)
                on conflict (user_id, verse_id) do update set
                  listened = coalesce(:l, verse_steps.listened), understood = coalesce(:un, verse_steps.understood),
                  action_done = coalesce(:a, verse_steps.action_done), chant_count = coalesce(:c, verse_steps.chant_count),
                  action_check_in = coalesce(:ci, verse_steps.action_check_in)
                """)
                .param("u", userId).param("v", verseId).param("l", u.listened()).param("un", u.understood())
                .param("a", u.actionDone()).param("c", u.chantCount()).param("ci", u.actionCheckIn())
                .update();
        return steps(userId).get(verseId);
    }

    /** FR-HM-06: finishing the step marks it complete and moves the streak by at most 1 per day. */
    @Transactional
    Completed complete(String userId, String verseId, ZoneId zone) {
        content.verse(verseId).orElseThrow(() -> ApiException.notFound("Verse " + verseId));
        db.sql("""
                insert into verse_steps (user_id, verse_id, listened, understood, completed_at) values (?, ?, true, true, now())
                on conflict (user_id, verse_id) do update set listened = true, understood = true,
                  completed_at = coalesce(verse_steps.completed_at, now())
                """).params(userId, verseId).update();
        var result = StreakRules.complete(streak(userId), LocalDate.now(zone));
        var s = result.streak();
        db.sql("""
                insert into streaks (user_id, current, longest, last_date, freezes) values (?, ?, ?, ?, ?)
                on conflict (user_id) do update set current = excluded.current, longest = excluded.longest,
                  last_date = excluded.last_date, freezes = excluded.freezes
                """).params(userId, s.current(), s.longest(), Date.valueOf(s.lastDate()), s.freezes()).update();
        events.publishEvent(new VerseStepCompleted(userId, verseId, s.current(), result.increased()));
        return new Completed(s, result.increased());
    }
}
