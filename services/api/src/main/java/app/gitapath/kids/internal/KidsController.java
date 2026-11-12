package app.gitapath.kids.internal;

import app.gitapath.content.ContentQuery;
import app.gitapath.content.Verse;
import app.gitapath.kids.internal.KidsStore.Profile;
import app.gitapath.kids.internal.KidsStore.Progress;
import app.gitapath.kids.internal.KidsStore.Settings;
import app.gitapath.shared.ApiException;
import app.gitapath.shared.AppProperties;
import app.gitapath.shared.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

/** Kids mode API (K1–K10). Every /v1/kids call except the shloka list acts for the signed-in parent. */
@RestController
class KidsController {
    static final int MAX_PROFILES = 4;

    record ProfileBody(@NotNull UUID id, @NotBlank @Size(max = 40) String name, @Min(3) @Max(12) int age,
                       @Pattern(regexp = "moru|gopal|chintu|radha|surabhi") String avatar) {}
    record ProgressBody(@Pattern(regexp = "story|shloka|game") String kind, @NotBlank @Size(max = 40) String itemId,
                        @Min(0) @Max(100) int stars) {}
    record SettingsBody(@Min(5) @Max(120) int dailyLimitMin, boolean bedtimeOn,
                        @Pattern(regexp = "\\d{2}:\\d{2}") String bedtimeStart, @Pattern(regexp = "\\d{2}:\\d{2}") String bedtimeEnd,
                        boolean chantGate, @Pattern(regexp = "hi\\+en|hi|en") String narration,
                        @Pattern(regexp = "gentle|strict") String strictness) {}
    record ShlokaSync(@NotBlank String id, @NotBlank String verseId, @NotBlank String title, @NotNull Map<String, Object> data) {}

    private final KidsStore store;
    private final ContentQuery content;
    private final AppProperties props;

    KidsController(KidsStore store, ContentQuery content, AppProperties props) {
        this.store = store;
        this.content = content;
        this.props = props;
    }

    @GetMapping("/v1/kids/shlokas")
    List<Map<String, Object>> shlokas() {
        return store.shlokas();
    }

    @GetMapping("/v1/kids/profiles")
    List<Profile> profiles() {
        return store.profiles(CurrentUser.id());
    }

    @PostMapping("/v1/kids/profiles")
    @Transactional
    ResponseEntity<Profile> saveProfile(@Valid @RequestBody ProfileBody b) {
        String parent = CurrentUser.id();
        boolean exists = store.profiles(parent).stream().anyMatch(p -> p.id().equals(b.id()));
        if (!exists && store.profileCount(parent) >= MAX_PROFILES) {
            throw ApiException.badRequest("A family can have up to " + MAX_PROFILES + " kids profiles");
        }
        Profile p = new Profile(b.id(), b.name().trim(), b.age(), b.avatar() == null ? "moru" : b.avatar());
        store.saveProfile(parent, p);
        return ResponseEntity.status(exists ? HttpStatus.OK : HttpStatus.CREATED).body(p);
    }

    @DeleteMapping("/v1/kids/profiles/{id}")
    ResponseEntity<Void> deleteProfile(@PathVariable UUID id) {
        store.requireOwner(CurrentUser.id(), id);
        store.deleteProfile(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/v1/kids/profiles/{id}/progress")
    Map<String, Object> record(@PathVariable UUID id, @Valid @RequestBody ProgressBody b) {
        store.requireOwner(CurrentUser.id(), id);
        store.record(id, b.kind(), b.itemId(), b.stars());
        return summary(id);
    }

    @GetMapping("/v1/kids/profiles/{id}/progress")
    Map<String, Object> progress(@PathVariable UUID id) {
        store.requireOwner(CurrentUser.id(), id);
        return summary(id);
    }

    @GetMapping("/v1/kids/settings")
    Settings settings() {
        return store.settings(CurrentUser.id());
    }

    @PatchMapping("/v1/kids/settings")
    Settings saveSettings(@Valid @RequestBody SettingsBody b) {
        Settings s = new Settings(b.dailyLimitMin(), b.bedtimeOn(), b.bedtimeStart(), b.bedtimeEnd(), b.chantGate(),
                b.narration(), b.strictness());
        store.saveSettings(CurrentUser.id(), s);
        return s;
    }

    /** Strapi publish webhook for kids shlokas. The Sanskrit lines must match the master verse exactly. */
    @PostMapping("/internal/content/kids-shlokas")
    Map<String, String> sync(@RequestHeader("X-Webhook-Secret") String secret, @Valid @RequestBody ShlokaSync b) {
        if (!props.cmsWebhookSecret().equals(secret)) throw ApiException.forbidden("Bad webhook secret");
        checkAgainstVerse(b.verseId(), b.data());
        store.upsertShloka(b.id(), b.verseId(), b.title(), b.data());
        return Map.of("id", b.id(), "status", "stored");
    }

    void checkAgainstVerse(String verseId, Map<String, Object> data) {
        Verse v = content.verse(verseId).orElseThrow(() -> ApiException.badRequest("Unknown verse " + verseId));
        Object lines = data.get("lines");
        if (!(lines instanceof List<?> list) || list.size() != v.sanskrit().size()) {
            throw ApiException.badRequest("Kids shloka " + verseId + " needs " + v.sanskrit().size() + " lines");
        }
        for (int i = 0; i < list.size(); i++) {
            Object s = list.get(i) instanceof Map<?, ?> m ? m.get("sanskrit") : null;
            if (!v.sanskrit().get(i).equals(s)) {
                throw new ApiException(HttpStatus.CONFLICT, "E-409",
                        "Line " + (i + 1) + " of the kids shloka must match verse " + verseId + " exactly");
            }
        }
    }

    private Map<String, Object> summary(UUID kidId) {
        List<Progress> items = store.progress(kidId);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("stars", items.stream().mapToInt(Progress::stars).sum());
        m.put("items", items);
        return m;
    }
}
