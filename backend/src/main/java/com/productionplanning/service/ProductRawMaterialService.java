package com.productionplanning.service;

import com.productionplanning.dto.ProductRawMaterialRequest;
import com.productionplanning.dto.ProductRawMaterialResponse;
import com.productionplanning.entity.Product;
import com.productionplanning.entity.ProductRawMaterial;
import com.productionplanning.entity.RawMaterial;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class ProductRawMaterialService {

    public List<ProductRawMaterialResponse> findAll() {
        return ProductRawMaterial.<ProductRawMaterial>listAll()
                .stream()
                .map(ProductRawMaterialResponse::from)
                .collect(Collectors.toList());
    }

    public List<ProductRawMaterialResponse> findByProduct(Long productId) {
        return ProductRawMaterial.findByProductId(productId)
                .stream()
                .map(ProductRawMaterialResponse::from)
                .collect(Collectors.toList());
    }

    public ProductRawMaterialResponse findById(Long id) {
        ProductRawMaterial entity = ProductRawMaterial.findById(id);
        if (entity == null) {
            throw new NotFoundException("Association not found with id: " + id);
        }
        return ProductRawMaterialResponse.from(entity);
    }

    @Transactional
    public ProductRawMaterialResponse create(ProductRawMaterialRequest request) {
        Product product = Product.findById(request.productId);
        if (product == null) {
            throw new NotFoundException("Product not found with id: " + request.productId);
        }

        RawMaterial rawMaterial = RawMaterial.findById(request.rawMaterialId);
        if (rawMaterial == null) {
            throw new NotFoundException("Raw material not found with id: " + request.rawMaterialId);
        }

        // Check for duplicate association
        boolean exists = ProductRawMaterial
                .count("product.id = ?1 and rawMaterial.id = ?2", request.productId, request.rawMaterialId) > 0;
        if (exists) {
            throw new BadRequestException(
                "Association between product " + request.productId +
                " and raw material " + request.rawMaterialId + " already exists."
            );
        }

        ProductRawMaterial entity = new ProductRawMaterial();
        entity.product = product;
        entity.rawMaterial = rawMaterial;
        entity.requiredQuantity = request.requiredQuantity;
        entity.persist();

        return ProductRawMaterialResponse.from(entity);
    }

    @Transactional
    public ProductRawMaterialResponse update(Long id, ProductRawMaterialRequest request) {
        ProductRawMaterial entity = ProductRawMaterial.findById(id);
        if (entity == null) {
            throw new NotFoundException("Association not found with id: " + id);
        }

        Product product = Product.findById(request.productId);
        if (product == null) {
            throw new NotFoundException("Product not found with id: " + request.productId);
        }

        RawMaterial rawMaterial = RawMaterial.findById(request.rawMaterialId);
        if (rawMaterial == null) {
            throw new NotFoundException("Raw material not found with id: " + request.rawMaterialId);
        }

        // Check for duplicate (excluding current record)
        boolean exists = ProductRawMaterial
                .count("product.id = ?1 and rawMaterial.id = ?2 and id != ?3",
                        request.productId, request.rawMaterialId, id) > 0;
        if (exists) {
            throw new BadRequestException(
                "Association between product " + request.productId +
                " and raw material " + request.rawMaterialId + " already exists."
            );
        }

        entity.product = product;
        entity.rawMaterial = rawMaterial;
        entity.requiredQuantity = request.requiredQuantity;

        return ProductRawMaterialResponse.from(entity);
    }

    @Transactional
    public void delete(Long id) {
        ProductRawMaterial entity = ProductRawMaterial.findById(id);
        if (entity == null) {
            throw new NotFoundException("Association not found with id: " + id);
        }
        entity.delete();
    }
}
