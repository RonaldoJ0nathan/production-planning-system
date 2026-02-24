package com.productionplanning.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Entity
@Table(
    name = "product_raw_materials",
    uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "raw_material_id"})
)
public class ProductRawMaterial extends PanacheEntity {

    @NotNull(message = "Product is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    public Product product;

    @NotNull(message = "Raw material is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "raw_material_id", nullable = false)
    public RawMaterial rawMaterial;

    @NotNull(message = "Required quantity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Required quantity must be greater than zero")
    @Column(name = "required_quantity", nullable = false)
    public Double requiredQuantity;

    public static List<ProductRawMaterial> findByProductId(Long productId) {
        return list("product.id", productId);
    }
}
