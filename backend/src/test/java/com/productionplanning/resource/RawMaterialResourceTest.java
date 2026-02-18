package com.productionplanning.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("RawMaterialResource - Integration Tests")
class RawMaterialResourceTest {

    @Test
    @Order(1)
    @DisplayName("GET /api/raw-materials should return a JSON array with status 200")
    void shouldReturnJsonArray() {
        given()
            .when().get("/api/raw-materials")
            .then()
            .statusCode(200)
            .body("$", notNullValue());
    }

    @Test
    @Order(2)
    @DisplayName("POST /api/raw-materials should create a raw material and return 201")
    void shouldCreateRawMaterial() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {"name": "Steel", "stockQuantity": 500.0}
                """)
            .when().post("/api/raw-materials")
            .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("name", equalTo("Steel"))
            .body("stockQuantity", equalTo(500.0f));
    }

    @Test
    @Order(3)
    @DisplayName("POST /api/raw-materials should return 400 when name is blank")
    void shouldReturn400WhenNameIsBlank() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {"name": "", "stockQuantity": 100.0}
                """)
            .when().post("/api/raw-materials")
            .then()
            .statusCode(400)
            .body("violations[0].field", containsString("name"));
    }

    @Test
    @Order(4)
    @DisplayName("POST /api/raw-materials should return 400 when stockQuantity is negative")
    void shouldReturn400WhenStockIsNegative() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {"name": "Iron", "stockQuantity": -1.0}
                """)
            .when().post("/api/raw-materials")
            .then()
            .statusCode(400);
    }

    @Test
    @Order(5)
    @DisplayName("GET /api/raw-materials/{id} should return 404 for unknown id")
    void shouldReturn404ForUnknownId() {
        given()
            .when().get("/api/raw-materials/99999")
            .then()
            .statusCode(404);
    }

    @Test
    @Order(6)
    @DisplayName("PUT /api/raw-materials/{id} should update raw material")
    void shouldUpdateRawMaterial() {
        // Create first
        int id = given()
            .contentType(ContentType.JSON)
            .body("""
                {"name": "Copper", "stockQuantity": 200.0}
                """)
            .when().post("/api/raw-materials")
            .then().statusCode(201)
            .extract().path("id");

        // Then update
        given()
            .contentType(ContentType.JSON)
            .body("""
                {"name": "Copper Updated", "stockQuantity": 300.0}
                """)
            .when().put("/api/raw-materials/" + id)
            .then()
            .statusCode(200)
            .body("name", equalTo("Copper Updated"))
            .body("stockQuantity", equalTo(300.0f));
    }

    @Test
    @Order(7)
    @DisplayName("DELETE /api/raw-materials/{id} should return 204")
    void shouldDeleteRawMaterial() {
        int id = given()
            .contentType(ContentType.JSON)
            .body("""
                {"name": "Zinc", "stockQuantity": 50.0}
                """)
            .when().post("/api/raw-materials")
            .then().statusCode(201)
            .extract().path("id");

        given()
            .when().delete("/api/raw-materials/" + id)
            .then()
            .statusCode(204);

        given()
            .when().get("/api/raw-materials/" + id)
            .then()
            .statusCode(404);
    }
}
