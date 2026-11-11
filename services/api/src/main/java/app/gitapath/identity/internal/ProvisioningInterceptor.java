package app.gitapath.identity.internal;

import app.gitapath.identity.UserDirectory;
import app.gitapath.shared.CurrentUser;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Upserts the caller's users row once per request, after Spring Security has authenticated them. */
@Configuration
class ProvisioningInterceptor implements WebMvcConfigurer, HandlerInterceptor {
    private final UserDirectory users;

    ProvisioningInterceptor(UserDirectory users) {
        this.users = users;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(this).addPathPatterns("/v1/**", "/admin/**");
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (SecurityContextHolder.getContext().getAuthentication() instanceof JwtAuthenticationToken) {
            users.ensure(CurrentUser.id(), CurrentUser.name());
        }
        return true;
    }
}
