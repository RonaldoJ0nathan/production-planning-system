package com.productionplanning.service;

import com.productionplanning.dto.ProductRequest;
import com.productionplanning.dto.ProductResponse;
import com.productionplanning.entity.Product;
import com.productionplanning.entity.ProductRawMaterial;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class ProductService {

    public List<ProductResponse> findAll() {
        return Product.<Product>listAll()
                .stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());
    }

    public ProductResponse findById(Long id) {
        Product entity = Product.findById(id);
        if (entity == null) {
            throw new NotFoundException("Product not found with id: " + id);
        }
        return ProductResponse.from(entity);
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product entity = new Product();
        entity.name = request.name;
        entity.value = request.value;
        entity.persist();
        return ProductResponse.from(entity);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product entity = Product.findById(id);
        if (entity == null) {
            throw new NotFoundException("Product not found with id: " + id);
        }
        entity.name = request.name;
        entity.value = request.value;
        return ProductResponse.from(entity);
    }

    @Transactional
    public void delete(Long id) {
        Product entity = Product.findById(id);
        if (entity == null) {
            throw new NotFoundException("Product not found with id: " + id);
        }
        // Check if product has raw material associations before deleting
        long associationCount = ProductRawMaterial.count("product.id", id);
        if (associationCount > 0) {
            throw new BadRequestException(
                "Cannot delete product with id " + id + ": it has " + associationCount + " raw material association(s). Remove them first."
            );
        }
        entity.delete();
    }
}
