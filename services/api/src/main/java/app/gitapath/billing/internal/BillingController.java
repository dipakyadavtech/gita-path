package app.gitapath.billing.internal;

import app.gitapath.billing.Entitlements;
import app.gitapath.identity.UserDirectory;
import app.gitapath.shared.ApiException;
import app.gitapath.shared.AppProperties;
import app.gitapath.shared.CurrentUser;
import java.util.Map;
import java.util.Set;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

/**
 * Entitlements plus the RevenueCat webhook. RevenueCat's app_user_id must be set to our user id in the app.
 * Events that grant access: INITIAL_PURCHASE, RENEWAL, UNCANCELLATION, PRODUCT_CHANGE.
 * Events that remove it: EXPIRATION. (CANCELLATION keeps access until expiry.)
 */
@RestController
class BillingController {
    private static final Set<String> GRANT = Set.of("INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION", "PRODUCT_CHANGE", "NON_RENEWING_PURCHASE");

    record RcEvent(String type, String app_user_id) {}
    record RcWebhook(RcEvent event) {}

    private final Entitlements entitlements;
    private final UserDirectory users;
    private final AppProperties props;

    BillingController(Entitlements entitlements, UserDirectory users, AppProperties props) {
        this.entitlements = entitlements;
        this.users = users;
        this.props = props;
    }

    @GetMapping("/v1/entitlements")
    Map<String, String> mine() {
        return Map.of("plan", entitlements.plan(CurrentUser.id()));
    }

    @PostMapping("/webhooks/revenuecat")
    Map<String, String> revenuecat(@RequestHeader("Authorization") String auth, @RequestBody RcWebhook body) {
        if (!("Bearer " + props.revenuecatWebhookSecret()).equals(auth)) throw ApiException.forbidden("Bad webhook secret");
        var e = body.event();
        if (e == null || e.app_user_id() == null) throw ApiException.badRequest("event.app_user_id is required");
        if (users.find(e.app_user_id()).isEmpty()) return Map.of("status", "ignored");
        if (GRANT.contains(e.type())) entitlements.set(e.app_user_id(), "plus", "revenuecat");
        else if ("EXPIRATION".equals(e.type())) entitlements.set(e.app_user_id(), "free", "revenuecat");
        return Map.of("status", "ok");
    }
}
