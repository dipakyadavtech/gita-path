package app.gitapath.content.internal;

import app.gitapath.content.ContentPublished;
import app.gitapath.content.Story;
import app.gitapath.content.Verse;
import app.gitapath.shared.ApiException;
import app.gitapath.shared.AppProperties;
import java.util.Map;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

/**
 * Called by the Strapi publish webhook (services/cms). Validates and stores published content.
 * Sanskrit text is locked: a change to an existing verse's Sanskrit is rejected unless the payload
 * says a scholar approved it (sanskritChangeApproved = true). NFR-12.
 */
@RestController
class CmsSyncController {
    record VerseSync(Verse verse, Boolean sanskritChangeApproved) {}
    record StorySync(Story story) {}

    private final ContentStore store;
    private final AppProperties props;
    private final ApplicationEventPublisher events;

    CmsSyncController(ContentStore store, AppProperties props, ApplicationEventPublisher events) {
        this.store = store;
        this.props = props;
        this.events = events;
    }

    @PostMapping("/internal/content/verses")
    @Transactional
    Map<String, String> syncVerse(@RequestHeader("X-Webhook-Secret") String secret, @RequestBody VerseSync body) {
        checkSecret(secret);
        Verse v = body.verse();
        if (v == null || v.id() == null || v.sanskrit() == null || v.sanskrit().isEmpty()) throw ApiException.badRequest("verse with id and sanskrit is required");
        String incoming = ContentStore.checksum(v.sanskrit());
        store.existingChecksum(v.id()).ifPresent(existing -> {
            if (!existing.equals(incoming) && !Boolean.TRUE.equals(body.sanskritChangeApproved())) {
                throw new ApiException(HttpStatus.CONFLICT, "E-409", "Sanskrit for " + v.id() + " differs from the master corpus and was not scholar-approved");
            }
        });
        store.upsertVerse(v);
        events.publishEvent(new ContentPublished("verse", v.id()));
        return Map.of("status", "stored", "id", v.id(), "checksum", incoming);
    }

    @PostMapping("/internal/content/stories")
    @Transactional
    Map<String, String> syncStory(@RequestHeader("X-Webhook-Secret") String secret, @RequestBody StorySync body) {
        checkSecret(secret);
        if (body.story() == null || body.story().id() == null) throw ApiException.badRequest("story with id is required");
        store.upsertStory(body.story());
        events.publishEvent(new ContentPublished("story", body.story().id()));
        return Map.of("status", "stored", "id", body.story().id());
    }

    private void checkSecret(String secret) {
        if (!props.cmsWebhookSecret().equals(secret)) throw ApiException.forbidden("Bad webhook secret");
    }
}
