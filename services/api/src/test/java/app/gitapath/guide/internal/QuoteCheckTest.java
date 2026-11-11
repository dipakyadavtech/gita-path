package app.gitapath.guide.internal;

import static org.assertj.core.api.Assertions.assertThat;

import app.gitapath.content.Verse;
import app.gitapath.guide.SafetyClassifier;
import java.util.List;
import org.junit.jupiter.api.Test;

class QuoteCheckTest {
    Verse v247 = new Verse("2.47", 2, 47, List.of("कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।", "मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥"),
            "", "", "", List.of(), List.of(), List.of("a"));

    @Test
    void keepsRealQuotes() {
        String text = "Verse 2.47 says कर्मण्येवाधिकारस्ते मा फलेषु कदाचन — focus on action.";
        assertThat(GuideService.verify(text, List.of(v247))).contains("कर्मण्येवाधिकारस्ते");
    }

    @Test
    void dropsInventedQuotes() {
        String text = "Good line.\nAs Krishna says, सब कुछ ठीक हो जाएगा हमेशा.\nAnother good line.";
        assertThat(GuideService.verify(text, List.of(v247))).doesNotContain("सब कुछ").contains("Good line.").contains("Another good line.");
    }

    @Test
    void detectsCrisisLanguage() {
        assertThat(SafetyClassifier.isCrisis("I feel hopeless and can't go on")).isTrue();
        assertThat(SafetyClassifier.isCrisis("मैं आत्महत्या के बारे में सोचता हूँ")).isTrue();
        assertThat(SafetyClassifier.isCrisis("I'm nervous about my exam")).isFalse();
    }
}
