# Build context: repo root (needs packages/content for seeding)
FROM eclipse-temurin:21-jdk AS build
WORKDIR /src
COPY packages/content packages/content
COPY services/api services/api
WORKDIR /src/services/api
RUN ./gradlew -q --no-daemon bootJar -x test

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /src/services/api/build/libs/*.jar app.jar
ENV TZ=UTC JAVA_TOOL_OPTIONS="-Duser.timezone=UTC"
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
