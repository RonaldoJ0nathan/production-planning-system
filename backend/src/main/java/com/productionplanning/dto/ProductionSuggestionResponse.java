package com.productionplanning.dto;

import java.math.BigDecimal;

public class ProductionSuggestionResponse {

    public Long productId;
    public String productName;
    public BigDecimal productValue;
    public int producibleQuantity;
    public BigDecimal totalValue;

    public ProductionSuggestionResponse(Long productId, String productName, BigDecimal productValue, int producibleQuantity) {
        this.productId = productId;
        this.productName = productName;
        this.productValue = productValue;
        this.producibleQuantity = producibleQuantity;
        this.totalValue = productValue.multiply(BigDecimal.valueOf(producibleQuantity));
    }
}
