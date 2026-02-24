FROM maven:3.9-eclipse-temurin-25

WORKDIR /app

# Copy only dependency descriptors first to cache dependencies as a layer
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline -Dquarkus.analytics.disabled=true

# src/ is mounted as a volume in dev mode — no COPY needed here
# In production, uncomment the lines below and remove the volume mount:
# COPY src ./src
# RUN ./mvnw package -DskipTests -Dquarkus.analytics.disabled=true

EXPOSE 8081

CMD ["./mvnw", "quarkus:dev", "-Dquarkus.http.host=0.0.0.0", "-Dquarkus.analytics.disabled=true"]
