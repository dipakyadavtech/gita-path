package app.gitapath.guide.internal;

import app.gitapath.shared.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
class GuideController {
    record AskRequest(@NotBlank @Size(max = 1000) String question) {}
    record FlagRequest(@Size(max = 200) String reason) {}

    private final GuideService guide;

    GuideController(GuideService guide) {
        this.guide = guide;
    }

    @PostMapping("/v1/ask")
    GuideService.Answer ask(@RequestBody @Valid AskRequest body) {
        return guide.ask(CurrentUser.id(), body.question());
    }

    @PostMapping("/v1/ask/{id}/flag")
    ResponseEntity<Void> flag(@PathVariable UUID id, @RequestBody FlagRequest body) {
        guide.flag(CurrentUser.id(), id, body.reason() == null ? "unspecified" : body.reason());
        return ResponseEntity.noContent().build();
    }
}
