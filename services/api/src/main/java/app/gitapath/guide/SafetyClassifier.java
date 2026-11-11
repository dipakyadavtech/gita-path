package app.gitapath.guide;

import java.util.List;
import java.util.Locale;

/**
 * First-pass crisis detection (FR-AI-04). Errs on the side of routing to helplines.
 * A trained classifier can replace this behind the same method later; the fixed reply never changes.
 */
public final class SafetyClassifier {
    private SafetyClassifier() {}

    private static final List<String> CRISIS = List.of(
            "suicide", "kill myself", "end my life", "don't want to live", "dont want to live", "want to die",
            "hopeless", "can't go on", "cant go on", "self harm", "self-harm", "hurt myself", "no reason to live",
            "मरना चाहता", "मरना चाहती", "जीना नहीं", "आत्महत्या");

    public static boolean isCrisis(String text) {
        String t = text.toLowerCase(Locale.ROOT);
        return CRISIS.stream().anyMatch(t::contains);
    }
}
