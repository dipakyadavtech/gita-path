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
        List<String> actions,
        /** Recitation recording URL from the CMS; null until a recording is published. */
        String audioUrl,
        /** Recitation video URL from the CMS; null until a video is published. */
        String videoUrl) {}
