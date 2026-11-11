package app.gitapath.learning.internal;

import app.gitapath.shared.CurrentUser;
import java.time.DateTimeException;
import java.time.ZoneId;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
class LearningController {
    private final LearningService learning;

    LearningController(LearningService learning) {
        this.learning = learning;
    }

    @GetMapping("/v1/today")
    LearningService.Today today(@RequestHeader(value = "X-Timezone", required = false) String tz) {
        return learning.today(CurrentUser.id(), zone(tz));
    }

    @GetMapping("/v1/path")
    LearningService.Path path(@RequestParam(defaultValue = "2") int chapter) {
        return learning.path(CurrentUser.id(), chapter);
    }

    @GetMapping("/v1/progress")
    Map<String, Object> progress() {
        String id = CurrentUser.id();
        return Map.of("steps", learning.steps(id), "streak", learning.streak(id));
    }

    @PatchMapping("/v1/progress/{verseId}")
    LearningService.Step update(@PathVariable String verseId, @RequestBody LearningService.StepUpdate body) {
        return learning.update(CurrentUser.id(), verseId, body);
    }

    @PostMapping("/v1/progress/{verseId}/complete")
    LearningService.Completed complete(@PathVariable String verseId, @RequestHeader(value = "X-Timezone", required = false) String tz) {
        return learning.complete(CurrentUser.id(), verseId, zone(tz));
    }

    static ZoneId zone(String tz) {
        try {
            return tz == null || tz.isBlank() ? ZoneId.of("Asia/Kolkata") : ZoneId.of(tz);
        } catch (DateTimeException e) {
            return ZoneId.of("Asia/Kolkata");
        }
    }
}
