package app.gitapath.identity;

/** Published after an account is deleted. Rows referencing the user are removed by foreign-key cascade. */
public record UserDeleted(String userId) {}
