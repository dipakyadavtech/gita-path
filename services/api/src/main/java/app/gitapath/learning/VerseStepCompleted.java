package app.gitapath.learning;

/** Published when a user finishes the day's verse-step (listen + understand + action/chant). */
public record VerseStepCompleted(String userId, String verseId, int streak, boolean streakIncreased) {}
