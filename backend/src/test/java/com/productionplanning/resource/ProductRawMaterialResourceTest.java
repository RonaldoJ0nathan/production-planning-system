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
@DisplayName("ProductRawMaterialResource - Integration Tests")
class ProductRawMaterialResourceTest {

    // IDs created in setup steps, shared across ordered tests
    private static int productId;
    private static int rawMaterialId;
    private static int associationId;

    @Test
    @Order(1)
    @DisplayName("Setup: create product and raw material for association tests")
    void setup() {
        productId = given()
            .contentType(ContentType.JSON)
            .body("""
                {"name": "Test Product", "value": 100.00}
                """)
            .when().post("/api/products")
            .then().statusCode(201)
            .extract().path("id");

        rawMaterialId = given()
            .contentType(ContentType.JSON)
            .body("""
                {"name": "Test Material", "stockQuantity": 200.0}
                """)
            .when().post("/api/raw-materials")
            .then().statusCode(201)
            .extract().path("id");
    }

    @Test
    @Order(2)
    @DisplayName("POST /api/product-raw-materials should create association and return 201")
    void shouldCreateAssociation() {
        associationId = given()
            .contentType(ContentType.JSON)
            .body(String.format("""
                {"productId": %d, "rawMaterialId": %d, "requiredQuantity": 5.0}
                """, productId, rawMaterialId))
            .when().post("/api/product-raw-materials")
            .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("productId", equalTo(productId))
            .body("rawMaterialId", equalTo(rawMaterialId))
            .body("requiredQuantity", equalTo(5.0f))
            .body("productName", equalTo("Test Product"))
            .body("rawMaterialName", equalTo("Test Material"))
            .extract().path("id");
    }

    @Test
    @Order(3)
    @DisplayName("POST /api/product-raw-materials should return 400 for duplicate association")
    void shouldReturn400ForDuplicateAssociation() {
        given()
            .contentType(ContentType.JSON)
            .body(String.format("""
                {"productId": %d, "rawMaterialId": %d, "requiredQuantity": 3.0}
                """, productId, rawMaterialId))
            .when().post("/api/product-raw-materials")
            .then()
            .statusCode(400);
    }

    @Test
    @Order(4)
    @DisplayName("GET /api/product-raw-materials/product/{id} should return associations for product")
    void shouldReturnAssociationsByProduct() {
        given()
            .when().get("/api/product-raw-materials/product/" + productId)
            .then()
            .statusCode(200)
            .body("", hasSize(1))
            .body("[0].productId", equalTo(productId));
    }

    @Test
    @Order(5)
    @DisplayName("PUT /api/product-raw-materials/{id} should update required quantity")
    void shouldUpdateAssociation() {
        given()
            .contentType(ContentType.JSON)
            .body(String.format("""
                {"productId": %d, "rawMaterialId": %d, "requiredQuantity": 10.0}
                """, productId, rawMaterialId))
            .when().put("/api/product-raw-materials/" + associationId)
            .then()
            .statusCode(200)
            .body("requiredQuantity", equalTo(10.0f));
    }

    @Test
    @Order(6)
    @DisplayName("DELETE /api/product-raw-materials/{id} should return 204")
    void shouldDeleteAssociation() {
        given()
            .when().delete("/api/product-raw-materials/" + associationId)
            .then()
            .statusCode(204);

        given()
            .when().get("/api/product-raw-materials/" + associationId)
            .then()
            .statusCode(404);
    }

    @Test
    @Order(7)
    @DisplayName("DELETE /api/products/{id} should return 400 when product has associations")
    void shouldReturn400WhenDeletingProductWithAssociations() {
        // Re-create association
        given()
            .contentType(ContentType.JSON)
            .body(String.format("""
                {"productId": %d, "rawMaterialId": %d, "requiredQuantity": 5.0}
                """, productId, rawMaterialId))
            .when().post("/api/product-raw-materials")
            .then().statusCode(201);

        // Try to delete product — should fail
        given()
            .when().delete("/api/products/" + productId)
            .then()
            .statusCode(400);
    }
}
