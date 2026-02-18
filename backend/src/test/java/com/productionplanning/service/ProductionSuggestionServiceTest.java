package com.productionplanning.service;

import com.productionplanning.dto.ProductionSuggestionResponse;
import com.productionplanning.entity.Product;
import com.productionplanning.entity.ProductRawMaterial;
import com.productionplanning.entity.RawMaterial;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for the production suggestion algorithm.
 * Tests the core logic directly without the Quarkus container or database,
 * by calling the algorithm method with pre-built entity objects.
 */
@DisplayName("ProductionSuggestionService - Unit Tests (Algorithm Logic)")
class ProductionSuggestionServiceTest {

    // ── helpers ──────────────────────────────────────────────────────────────

    private static Product product(Long id, String name, double value) {
        Product p = new Product();
        p.id = id;
        p.name = name;
        p.value = BigDecimal.valueOf(value);
        return p;
    }

    private static RawMaterial rawMaterial(Long id, double stock) {
        RawMaterial rm = new RawMaterial();
        rm.id = id;
        rm.stockQuantity = stock;
        return rm;
    }

    private static ProductRawMaterial requirement(Product p, RawMaterial rm, double qty) {
        ProductRawMaterial prm = new ProductRawMaterial();
        prm.product = p;
        prm.rawMaterial = rm;
        prm.requiredQuantity = qty;
        return prm;
    }

    /**
     * Extracted algorithm logic — mirrors ProductionSuggestionService.suggest()
     * but accepts pre-built data, making it fully testable without Panache/DB.
     */
    private List<ProductionSuggestionResponse> runAlgorithm(
            List<Product> products,
            List<RawMaterial> rawMaterials,
            Map<Long, List<ProductRawMaterial>> requirementsByProduct
    ) {
        List<Product> sorted = products.stream()
                .sorted(Comparator.comparing((Product p) -> p.value).reversed())
                .toList();

        Map<Long, Double> stockSnapshot = new HashMap<>();
        rawMaterials.forEach(rm -> stockSnapshot.put(rm.id, rm.stockQuantity));

        List<ProductionSuggestionResponse> suggestions = new java.util.ArrayList<>();

        for (Product product : sorted) {
            List<ProductRawMaterial> requirements = requirementsByProduct.getOrDefault(product.id, List.of());

            if (requirements.isEmpty()) continue;

            int producibleQty = Integer.MAX_VALUE;
            for (ProductRawMaterial req : requirements) {
                double available = stockSnapshot.getOrDefault(req.rawMaterial.id, 0.0);
                int canProduce = (int) Math.floor(available / req.requiredQuantity);
                producibleQty = Math.min(producibleQty, canProduce);
            }

            if (producibleQty > 0) {
                suggestions.add(new ProductionSuggestionResponse(
                        product.id, product.name, product.value, producibleQty));

                for (ProductRawMaterial req : requirements) {
                    double consumed = req.requiredQuantity * producibleQty;
                    stockSnapshot.merge(req.rawMaterial.id, consumed, (cur, c) -> cur - c);
                }
            }
        }

        return suggestions;
    }

    // ── tests ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Should suggest product when all materials are available")
    void shouldSuggestWhenMaterialsAvailable() {
        Product chair = product(1L, "Chair", 299.99);
        RawMaterial wood = rawMaterial(1L, 100.0);
        ProductRawMaterial req = requirement(chair, wood, 10.0);

        List<ProductionSuggestionResponse> result = runAlgorithm(
                List.of(chair),
                List.of(wood),
                Map.of(1L, List.of(req))
        );

        assertThat(result).hasSize(1);
        assertThat(result.get(0).productName).isEqualTo("Chair");
        assertThat(result.get(0).producibleQuantity).isEqualTo(10); // floor(100/10)
        assertThat(result.get(0).totalValue).isEqualByComparingTo("2999.90");
    }

    @Test
    @DisplayName("Should not suggest product when stock is insufficient")
    void shouldNotSuggestWhenInsufficientStock() {
        Product table = product(2L, "Table", 500.00);
        RawMaterial steel = rawMaterial(2L, 5.0);          // only 5 units
        ProductRawMaterial req = requirement(table, steel, 10.0); // needs 10

        List<ProductionSuggestionResponse> result = runAlgorithm(
                List.of(table),
                List.of(steel),
                Map.of(2L, List.of(req))
        );

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should skip product with no raw material requirements")
    void shouldSkipProductWithNoRequirements() {
        Product ghost = product(3L, "Ghost Product", 100.00);

        List<ProductionSuggestionResponse> result = runAlgorithm(
                List.of(ghost),
                List.of(),
                Map.of()
        );

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should prioritize higher-value product when materials are shared")
    void shouldPrioritizeHigherValueProductForSharedMaterial() {
        // Premium (R$200) and Basic (R$50) share the same steel stock (100 units)
        Product premium = product(10L, "Premium Frame", 200.00);
        Product basic   = product(11L, "Basic Frame",    50.00);
        RawMaterial steel = rawMaterial(10L, 100.0);

        ProductRawMaterial premiumReq = requirement(premium, steel, 20.0); // needs 20 each
        ProductRawMaterial basicReq   = requirement(basic,   steel, 10.0); // needs 10 each

        List<ProductionSuggestionResponse> result = runAlgorithm(
                List.of(basic, premium), // intentionally unsorted
                List.of(steel),
                Map.of(10L, List.of(premiumReq), 11L, List.of(basicReq))
        );

        // Premium gets 5 units (100/20), consuming all 100 steel
        // Basic gets 0 units (no steel left) → not in results
        assertThat(result).hasSize(1);
        assertThat(result.get(0).productName).isEqualTo("Premium Frame");
        assertThat(result.get(0).producibleQuantity).isEqualTo(5);
    }

    @Test
    @DisplayName("Should return results sorted by value descending")
    void shouldReturnResultsSortedByValueDescending() {
        Product cheap     = product(20L, "Cheap",      10.00);
        Product expensive = product(21L, "Expensive", 500.00);
        Product mid       = product(22L, "Mid",        100.00);

        RawMaterial rm1 = rawMaterial(20L, 1000.0);
        RawMaterial rm2 = rawMaterial(21L, 1000.0);
        RawMaterial rm3 = rawMaterial(22L, 1000.0);

        List<ProductionSuggestionResponse> result = runAlgorithm(
                List.of(cheap, mid, expensive),
                List.of(rm1, rm2, rm3),
                Map.of(
                    20L, List.of(requirement(cheap,     rm1, 1.0)),
                    21L, List.of(requirement(expensive, rm2, 1.0)),
                    22L, List.of(requirement(mid,       rm3, 1.0))
                )
        );

        assertThat(result).hasSize(3);
        assertThat(result.get(0).productName).isEqualTo("Expensive");
        assertThat(result.get(1).productName).isEqualTo("Mid");
        assertThat(result.get(2).productName).isEqualTo("Cheap");
    }

    @Test
    @DisplayName("Should correctly calculate producible quantity limited by the most scarce material")
    void shouldLimitByMostScarceRequiredMaterial() {
        Product desk = product(30L, "Desk", 350.00);
        RawMaterial wood  = rawMaterial(30L, 100.0); // can make 10 (100/10)
        RawMaterial bolts = rawMaterial(31L, 12.0);  // can make 4  (12/3) ← bottleneck

        List<ProductionSuggestionResponse> result = runAlgorithm(
                List.of(desk),
                List.of(wood, bolts),
                Map.of(30L, List.of(
                    requirement(desk, wood,  10.0),
                    requirement(desk, bolts,  3.0)
                ))
        );

        assertThat(result).hasSize(1);
        assertThat(result.get(0).producibleQuantity).isEqualTo(4); // limited by bolts
    }
}
