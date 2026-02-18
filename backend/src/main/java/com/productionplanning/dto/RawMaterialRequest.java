package com.productionplanning.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RawMaterialRequest {

    @NotBlank(message = "Name is required")
    public String name;

    @NotNull(message = "Stock quantity is required")
    @DecimalMin(value = "0.0", message = "Stock quantity must be zero or greater")
    public Double stockQuantity;
}
