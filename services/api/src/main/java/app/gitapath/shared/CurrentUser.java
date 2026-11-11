package app.gitapath.shared;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

/** Reads the signed-in user from the security context. */
public final class CurrentUser {
    private CurrentUser() {}

    public static String id() {
        return jwt().getSubject();
    }

    public static String name() {
        Jwt jwt = jwt();
        for (String claim : new String[] {"name", "first_name", "given_name"}) {
            String v = jwt.getClaimAsString(claim);
            if (v != null && !v.isBlank()) return v;
        }
        return "Friend";
    }

    private static Jwt jwt() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken t) return t.getToken();
        throw new IllegalStateException("No signed-in user");
    }
}
