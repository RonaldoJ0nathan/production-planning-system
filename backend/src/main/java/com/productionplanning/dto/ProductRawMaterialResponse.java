package com.productionplanning.dto;

import com.productionplanning.entity.ProductRawMaterial;

public class ProductRawMaterialResponse {

    public Long id;
    public Long productId;
    public String productName;
    public Long rawMaterialId;
    public String rawMaterialName;
    public Double requiredQuantity;

    public static ProductRawMaterialResponse from(ProductRawMaterial entity) {
        ProductRawMaterialResponse dto = new ProductRawMaterialResponse();
        dto.id = entity.id;
        dto.productId = entity.product.id;
        dto.productName = entity.product.name;
        dto.rawMaterialId = entity.rawMaterial.id;
        dto.rawMaterialName = entity.rawMaterial.name;
        dto.requiredQuantity = entity.requiredQuantity;
        return dto;
    }
}
