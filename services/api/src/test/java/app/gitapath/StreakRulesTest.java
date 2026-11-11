package app.gitapath;

import static org.assertj.core.api.Assertions.assertThat;

import app.gitapath.learning.StreakRules;
import app.gitapath.learning.StreakRules.Streak;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class StreakRulesTest {
    final LocalDate today = LocalDate.of(2026, 11, 12);

    @Test
    void firstCompletionStartsAtOne() {
        var r = StreakRules.complete(new Streak(0, 0, null, 1), today);
        assertThat(r.streak().current()).isEqualTo(1);
        assertThat(r.increased()).isTrue();
    }

    @Test
    void sameDayDoesNotDoubleCount() {
        var r = StreakRules.complete(new Streak(5, 5, today, 1), today);
        assertThat(r.streak().current()).isEqualTo(5);
        assertThat(r.increased()).isFalse();
    }

    @Test
    void nextDayAddsOne() {
        var r = StreakRules.complete(new Streak(5, 9, today.minusDays(1), 1), today);
        assertThat(r.streak().current()).isEqualTo(6);
        assertThat(r.streak().longest()).isEqualTo(9);
    }

    @Test
    void oneMissedDayUsesAFreeze() {
        var r = StreakRules.complete(new Streak(5, 5, today.minusDays(2), 1), today);
        assertThat(r.streak().current()).isEqualTo(6);
        assertThat(r.streak().freezes()).isZero();
    }

    @Test
    void missedDayWithoutFreezeRestarts() {
        var r = StreakRules.complete(new Streak(5, 5, today.minusDays(2), 0), today);
        assertThat(r.streak().current()).isEqualTo(1);
        assertThat(r.streak().longest()).isEqualTo(5);
    }
}
