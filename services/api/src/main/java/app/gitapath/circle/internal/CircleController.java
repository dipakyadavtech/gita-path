package app.gitapath.circle.internal;

import app.gitapath.shared.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
class CircleController {
    record CreateCircle(@NotBlank @Size(max = 40) String name) {}

    private final CircleService circles;

    CircleController(CircleService circles) {
        this.circles = circles;
    }

    @PostMapping("/v1/circles")
    CircleService.CircleView create(@RequestBody @Valid CreateCircle body) {
        return circles.create(CurrentUser.id(), body.name().trim());
    }

    @GetMapping("/v1/circles/mine")
    CircleService.CircleView mine() {
        return circles.mine(CurrentUser.id());
    }

    @PostMapping("/v1/circles/mine/invite")
    CircleService.CircleView invite() {
        return circles.newInvite(CurrentUser.id());
    }

    @GetMapping("/v1/circles/join/{code}")
    CircleService.Preview preview(@PathVariable String code) {
        return circles.preview(code);
    }

    @PostMapping("/v1/circles/join/{code}")
    ResponseEntity<Void> join(@PathVariable String code) {
        circles.requestJoin(CurrentUser.id(), code);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/v1/circles/mine/members/{userId}/approve")
    CircleService.CircleView approve(@PathVariable String userId) {
        return circles.decide(CurrentUser.id(), userId, true);
    }

    @PostMapping("/v1/circles/mine/members/{userId}/decline")
    CircleService.CircleView decline(@PathVariable String userId) {
        return circles.decide(CurrentUser.id(), userId, false);
    }

    @DeleteMapping("/v1/circles/mine/membership")
    ResponseEntity<Void> leave() {
        circles.leave(CurrentUser.id());
        return ResponseEntity.noContent().build();
    }
}
