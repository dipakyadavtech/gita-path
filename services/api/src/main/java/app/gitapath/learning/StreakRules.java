package app.gitapath.learning;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Streak rules (FR-HM-01/05): +1 for a new day; a single missed day uses a freeze if one is left;
 * otherwise the streak restarts at 1. Completing twice on the same day changes nothing.
 */
public final class StreakRules {
    private StreakRules() {}

    public record Streak(int current, int longest, LocalDate lastDate, int freezes) {}
    public record Result(Streak streak, boolean increased) {}

    public static Result complete(Streak s, LocalDate today) {
        if (today.equals(s.lastDate())) return new Result(s, false);
        int current;
        int freezes = s.freezes();
        long gap = s.lastDate() == null ? 1 : ChronoUnit.DAYS.between(s.lastDate(), today);
        if (gap == 1) current = s.current() + 1;
        else if (gap == 2 && freezes > 0) { current = s.current() + 1; freezes--; }
        else current = 1;
        return new Result(new Streak(current, Math.max(s.longest(), current), today, freezes), true);
    }
}
