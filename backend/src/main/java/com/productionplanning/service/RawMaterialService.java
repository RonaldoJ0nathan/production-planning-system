package com.productionplanning.service;

import com.productionplanning.dto.RawMaterialRequest;
import com.productionplanning.dto.RawMaterialResponse;
import com.productionplanning.entity.RawMaterial;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class RawMaterialService {

    public List<RawMaterialResponse> findAll() {
        return RawMaterial.<RawMaterial>listAll()
                .stream()
                .map(RawMaterialResponse::from)
                .collect(Collectors.toList());
    }

    public RawMaterialResponse findById(Long id) {
        RawMaterial entity = RawMaterial.findById(id);
        if (entity == null) {
            throw new NotFoundException("Raw material not found with id: " + id);
        }
        return RawMaterialResponse.from(entity);
    }

    @Transactional
    public RawMaterialResponse create(RawMaterialRequest request) {
        RawMaterial entity = new RawMaterial();
        entity.name = request.name;
        entity.stockQuantity = request.stockQuantity;
        entity.persist();
        return RawMaterialResponse.from(entity);
    }

    @Transactional
    public RawMaterialResponse update(Long id, RawMaterialRequest request) {
        RawMaterial entity = RawMaterial.findById(id);
        if (entity == null) {
            throw new NotFoundException("Raw material not found with id: " + id);
        }
        entity.name = request.name;
        entity.stockQuantity = request.stockQuantity;
        return RawMaterialResponse.from(entity);
    }

    @Transactional
    public void delete(Long id) {
        RawMaterial entity = RawMaterial.findById(id);
        if (entity == null) {
            throw new NotFoundException("Raw material not found with id: " + id);
        }
        entity.delete();
    }
}
