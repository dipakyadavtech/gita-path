package app.gitapath.identity.internal;

import app.gitapath.shared.ApiException;
import app.gitapath.shared.AppProperties;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * Dev sign-in. Mirrors the app's dev OTP flow (code 123456) so the API can be used without Clerk.
 * Disabled automatically when CLERK_ISSUER is set.
 */
@RestController
@Validated
class AuthController {
    static final String DEV_OTP = "123456";

    record DevTokenRequest(@NotBlank @Pattern(regexp = "\\d{10}") String phone, @NotBlank String otp, String name, Boolean admin) {}

    private final AppProperties props;
    private final NimbusJwtEncoder encoder;

    AuthController(AppProperties props) {
        this.props = props;
        var key = new SecretKeySpec(props.devAuthSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        this.encoder = new NimbusJwtEncoder(new ImmutableSecret<>(key));
    }

    @PostMapping("/v1/auth/dev-token")
    Map<String, String> devToken(@RequestBody @jakarta.validation.Valid DevTokenRequest req) {
        if (!props.devTokensAllowed()) throw new ApiException(HttpStatus.NOT_FOUND, "E-404", "Dev sign-in is disabled");
        if (!DEV_OTP.equals(req.otp())) throw ApiException.badRequest("That code is not right. In dev mode the code is 123456.");
        Instant now = Instant.now();
        var claims = JwtClaimsSet.builder()
                .subject("dev-" + req.phone())
                .issuedAt(now)
                .expiresAt(now.plus(30, ChronoUnit.DAYS))
                .claim("name", req.name() == null || req.name().isBlank() ? "Friend" : req.name())
                .claim("admin", Boolean.TRUE.equals(req.admin()))
                .build();
        String token = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return Map.of("token", token, "userId", "dev-" + req.phone());
    }
}
