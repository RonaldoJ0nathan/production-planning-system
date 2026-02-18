package com.productionplanning.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
public class Product extends PanacheEntity {

    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    public String name;

    @NotNull(message = "Value is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Value must be greater than zero")
    @Column(name = "product_value", nullable = false, precision = 15, scale = 2)
    public BigDecimal value;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    public List<ProductRawMaterial> rawMaterials = new ArrayList<>();
}
