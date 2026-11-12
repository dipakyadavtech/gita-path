package app.gitapath.shared;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Stateless JWT security.
 * - Clerk mode (gitapath.clerk-issuer set): verifies Clerk session tokens via the issuer's JWKS.
 * - Dev mode: verifies HS256 tokens issued by POST /v1/auth/dev-token.
 */
@Configuration
@EnableConfigurationProperties(AppProperties.class)
class SecurityConfig {

    @Bean
    SecurityFilterChain api(HttpSecurity http, AppProperties props) throws Exception {
        http.csrf(c -> c.disable())
                .cors(c -> {})
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        .requestMatchers("/actuator/health/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers(HttpMethod.POST, "/v1/auth/dev-token").permitAll()
                        .requestMatchers("/internal/**", "/webhooks/**").permitAll() // shared-secret checked in controllers
                        .requestMatchers(HttpMethod.GET, "/v1/verses/**", "/v1/chapters/**", "/v1/stories/**", "/v1/topics/**", "/v1/search", "/v1/kids/shlokas").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(converter(props))));
        return http.build();
    }

    /** CORS for the Expo web build and the admin portal. Set ALLOWED_ORIGINS in production. */
    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${gitapath.allowed-origins:*}") List<String> origins) {
        var c = new CorsConfiguration();
        c.setAllowedOriginPatterns(origins);
        c.setAllowedMethods(List.of("GET", "POST", "PATCH", "DELETE", "OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", c);
        return source;
    }

    @Bean
    JwtDecoder jwtDecoder(AppProperties props) {
        if (props.clerkEnabled()) {
            return JwtDecoders.fromIssuerLocation(props.clerkIssuer());
        }
        var key = new SecretKeySpec(props.devAuthSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
    }

    private JwtAuthenticationConverter converter(AppProperties props) {
        var c = new JwtAuthenticationConverter();
        c.setJwtGrantedAuthoritiesConverter(jwt -> {
            Collection<GrantedAuthority> out = new ArrayList<>();
            out.add(new SimpleGrantedAuthority("ROLE_USER"));
            List<String> admins = props.adminUsers() == null ? List.of() : props.adminUsers();
            boolean devAdmin = props.devTokensAllowed() && Boolean.TRUE.equals(jwt.getClaimAsBoolean("admin"));
            if (admins.contains(jwt.getSubject()) || devAdmin) {
                out.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            }
            return out;
        });
        return c;
    }
}
