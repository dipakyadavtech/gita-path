package app.gitapath.content;

/** Raised after the CMS publishes (or updates) a verse and it has been validated and stored. */
public record ContentPublished(String type, String id) {}
