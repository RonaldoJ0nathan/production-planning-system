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
@DisplayName("ProductResource - Integration Tests")
class ProductResourceTest {

    @Test
    @Order(1)
    @DisplayName("GET /api/products should return a JSON array with status 200")
    void shouldReturnJsonArray() {
        given()
            .when().get("/api/products")
            .then()
            .statusCode(200)
            .body("$", notNullValue());
    }

    @Test
    @Order(2)
    @DisplayName("POST /api/products should create a product and return 201")
    void shouldCreateProduct() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {"name": "Widget", "value": 99.99}
                """)
            .when().post("/api/products")
            .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("name", equalTo("Widget"))
            .body("value", equalTo(99.99f));
    }

    @Test
    @Order(3)
    @DisplayName("POST /api/products should return 400 when name is blank")
    void shouldReturn400WhenNameIsBlank() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {"name": "", "value": 10.00}
                """)
            .when().post("/api/products")
            .then()
            .statusCode(400)
            .body("violations[0].field", containsString("name"));
    }

    @Test
    @Order(4)
    @DisplayName("POST /api/products should return 400 when value is zero")
    void shouldReturn400WhenValueIsZero() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {"name": "Free Product", "value": 0.00}
                """)
            .when().post("/api/products")
            .then()
            .statusCode(400);
    }

    @Test
    @Order(5)
    @DisplayName("GET /api/products/{id} should return 404 for unknown id")
    void shouldReturn404ForUnknownId() {
        given()
            .when().get("/api/products/99999")
            .then()
            .statusCode(404);
    }

    @Test
    @Order(6)
    @DisplayName("PUT /api/products/{id} should update product")
    void shouldUpdateProduct() {
        int id = given()
            .contentType(ContentType.JSON)
            .body("""
                {"name": "Old Name", "value": 50.00}
                """)
            .when().post("/api/products")
            .then().statusCode(201)
            .extract().path("id");

        given()
            .contentType(ContentType.JSON)
            .body("""
                {"name": "New Name", "value": 75.00}
                """)
            .when().put("/api/products/" + id)
            .then()
            .statusCode(200)
            .body("name", equalTo("New Name"))
            .body("value", equalTo(75.00f));
    }

    @Test
    @Order(7)
    @DisplayName("DELETE /api/products/{id} should return 204 when no associations exist")
    void shouldDeleteProductWithNoAssociations() {
        int id = given()
            .contentType(ContentType.JSON)
            .body("""
                {"name": "Disposable", "value": 1.00}
                """)
            .when().post("/api/products")
            .then().statusCode(201)
            .extract().path("id");

        given()
            .when().delete("/api/products/" + id)
            .then()
            .statusCode(204);

        given()
            .when().get("/api/products/" + id)
            .then()
            .statusCode(404);
    }
}
