package com.productionplanning.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class ProductRawMaterialRequest {

    @NotNull(message = "Product ID is required")
    public Long productId;

    @NotNull(message = "Raw material ID is required")
    public Long rawMaterialId;

    @NotNull(message = "Required quantity is required")
    @DecimalMin(value = "0.01", message = "Required quantity must be greater than zero")
    public Double requiredQuantity;
}
