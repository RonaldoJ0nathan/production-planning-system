package com.productionplanning.dto;

import com.productionplanning.entity.RawMaterial;

public class RawMaterialResponse {

    public Long id;
    public String name;
    public Double stockQuantity;

    public static RawMaterialResponse from(RawMaterial entity) {
        RawMaterialResponse dto = new RawMaterialResponse();
        dto.id = entity.id;
        dto.name = entity.name;
        dto.stockQuantity = entity.stockQuantity;
        return dto;
    }
}
