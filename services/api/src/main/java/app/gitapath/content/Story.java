package app.gitapath.content;

import java.util.List;

public record Story(String id, int season, int episode, String title, int minutes, String verseId,
        Boolean kidsSafe, Boolean kids, String summary, List<List<String>> scenes) {}
