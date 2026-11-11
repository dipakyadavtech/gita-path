package app.gitapath.shared;

import java.util.List;
import org.springframework.stereotype.Component;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

/** Small helper for jsonb columns. */
@Component
public class Json {
    private final JsonMapper mapper;

    public Json(JsonMapper mapper) {
        this.mapper = mapper;
    }

    public String write(Object value) {
        return mapper.writeValueAsString(value);
    }

    public <T> T read(String json, Class<T> type) {
        return mapper.readValue(json, type);
    }

    public <T> T read(String json, TypeReference<T> type) {
        return mapper.readValue(json, type);
    }

    public List<String> strings(String json) {
        return read(json, new TypeReference<List<String>>() {});
    }

    public JsonMapper mapper() {
        return mapper;
    }
}
