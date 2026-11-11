package app.gitapath;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Gita Path API — a modular monolith (Spring Modulith).
 * Each top-level package is a module; its root package is the public API and `internal`
 * sub-packages are private. Modules talk through those public types or through events.
 */
@SpringBootApplication
@EnableAsync
public class GitaPathApplication {
    public static void main(String[] args) {
        // Servers run in UTC; user-facing dates use the X-Timezone header.
        java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("UTC"));
        SpringApplication.run(GitaPathApplication.class, args);
    }
}
