package com.productionplanning.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "raw_materials")
public class RawMaterial extends PanacheEntity {

    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    public String name;

    @NotNull(message = "Stock quantity is required")
    @DecimalMin(value = "0.0", message = "Stock quantity must be zero or greater")
    @Column(name = "stock_quantity", nullable = false)
    public Double stockQuantity;
}
