package com.productionplanning.resource;

import com.productionplanning.dto.ProductRawMaterialRequest;
import com.productionplanning.dto.ProductRawMaterialResponse;
import com.productionplanning.service.ProductRawMaterialService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

@Path("/api/product-raw-materials")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Product Raw Materials", description = "Manage associations between products and raw materials")
public class ProductRawMaterialResource {

    @Inject
    ProductRawMaterialService service;

    @GET
    @Operation(summary = "List all product-raw material associations")
    public List<ProductRawMaterialResponse> findAll() {
        return service.findAll();
    }

    @GET
    @Path("/product/{productId}")
    @Operation(summary = "List all raw materials associated with a specific product")
    public List<ProductRawMaterialResponse> findByProduct(@PathParam("productId") Long productId) {
        return service.findByProduct(productId);
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get an association by ID")
    public ProductRawMaterialResponse findById(@PathParam("id") Long id) {
        return service.findById(id);
    }

    @POST
    @Operation(summary = "Associate a raw material with a product")
    public Response create(@Valid ProductRawMaterialRequest request) {
        ProductRawMaterialResponse response = service.create(request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update an existing association")
    public ProductRawMaterialResponse update(@PathParam("id") Long id, @Valid ProductRawMaterialRequest request) {
        return service.update(id, request);
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Remove an association between a product and a raw material")
    public Response delete(@PathParam("id") Long id) {
        service.delete(id);
        return Response.noContent().build();
    }
}
