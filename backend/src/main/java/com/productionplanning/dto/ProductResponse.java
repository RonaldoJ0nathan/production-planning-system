package com.productionplanning.dto;

import com.productionplanning.entity.Product;

import java.math.BigDecimal;

public class ProductResponse {

    public Long id;
    public String name;
    public BigDecimal value;

    public static ProductResponse from(Product entity) {
        ProductResponse dto = new ProductResponse();
        dto.id = entity.id;
        dto.name = entity.name;
        dto.value = entity.value;
        return dto;
    }
}
