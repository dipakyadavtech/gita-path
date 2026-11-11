package app.gitapath.shared;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("gitapath")
public record AppProperties(
        String clerkIssuer,
        String devAuthSecret,
        boolean devAuthEnabled,
        String cmsWebhookSecret,
        String revenuecatWebhookSecret,
        List<String> adminUsers,
        Guide guide) {

    public record Guide(int freeDailyQuestions, String llmUrl, String llmKey, String llmModel) {}

    public boolean clerkEnabled() {
        return clerkIssuer != null && !clerkIssuer.isBlank();
    }

    public boolean devTokensAllowed() {
        return devAuthEnabled && !clerkEnabled();
    }
}
