package app.gitapath.content;

import java.util.List;

public record Verse(
        String id,
        int chapter,
        int number,
        List<String> sanskrit,
        String iast,
        String meaning,
        String lifeNote,
        List<List<String>> words,
        List<String> themes,
        List<String> actions) {}
