package com.productionplanning.service;

import com.productionplanning.dto.ProductionSuggestionResponse;
import com.productionplanning.entity.Product;
import com.productionplanning.entity.ProductRawMaterial;
import com.productionplanning.entity.RawMaterial;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class ProductionSuggestionService {

    /**
     * RF004 — Calculates which products can be produced with the current stock.
     *
     * Algorithm:
     * 1. Load all products ordered by value DESC (highest value first).
     * 2. Take a mutable snapshot of the current stock for all raw materials.
     * 3. For each product (in priority order):
     *    a. Load its required raw materials.
     *    b. If it has no raw materials defined, skip it.
     *    c. Calculate the maximum producible quantity:
     *       floor(availableStock / requiredQuantity) for each material → take the minimum.
     *    d. If producible quantity > 0, add to suggestions and deduct consumed stock from snapshot.
     * 4. Return only products with producible quantity > 0, sorted by value DESC.
     */
    public List<ProductionSuggestionResponse> suggest() {
        // Step 1: load products sorted by value descending
        List<Product> products = Product.<Product>listAll()
                .stream()
                .sorted(Comparator.comparing((Product p) -> p.value).reversed())
                .toList();

        // Step 2: build a mutable stock snapshot (rawMaterialId -> availableQty)
        Map<Long, Double> stockSnapshot = new HashMap<>();
        RawMaterial.<RawMaterial>listAll()
                .forEach(rm -> stockSnapshot.put(rm.id, rm.stockQuantity));

        // Step 3: evaluate each product
        List<ProductionSuggestionResponse> suggestions = new ArrayList<>();

        for (Product product : products) {
            List<ProductRawMaterial> requirements = ProductRawMaterial.findByProductId(product.id);

            // Skip products with no raw material requirements defined
            if (requirements.isEmpty()) {
                continue;
            }

            // Calculate max producible quantity limited by each raw material's stock
            int producibleQty = Integer.MAX_VALUE;
            for (ProductRawMaterial req : requirements) {
                double available = stockSnapshot.getOrDefault(req.rawMaterial.id, 0.0);
                int canProduce = (int) Math.floor(available / req.requiredQuantity);
                producibleQty = Math.min(producibleQty, canProduce);
            }

            // Only suggest if at least 1 unit can be produced
            if (producibleQty > 0) {
                suggestions.add(new ProductionSuggestionResponse(
                        product.id,
                        product.name,
                        product.value,
                        producibleQty
                ));

                // Deduct consumed stock from snapshot so shared materials are correctly accounted for
                for (ProductRawMaterial req : requirements) {
                    double consumed = req.requiredQuantity * producibleQty;
                    stockSnapshot.merge(req.rawMaterial.id, consumed, (current, c) -> current - c);
                }
            }
        }

        return suggestions;
    }
}
