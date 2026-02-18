package com.productionplanning.resource;

import com.productionplanning.dto.ProductRequest;
import com.productionplanning.dto.ProductResponse;
import com.productionplanning.service.ProductService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

@Path("/api/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Products", description = "CRUD operations for products")
public class ProductResource {

    @Inject
    ProductService service;

    @GET
    @Operation(summary = "List all products")
    public List<ProductResponse> findAll() {
        return service.findAll();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get a product by ID")
    public ProductResponse findById(@PathParam("id") Long id) {
        return service.findById(id);
    }

    @POST
    @Operation(summary = "Create a new product")
    public Response create(@Valid ProductRequest request) {
        ProductResponse response = service.create(request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update an existing product")
    public ProductResponse update(@PathParam("id") Long id, @Valid ProductRequest request) {
        return service.update(id, request);
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete a product by ID")
    public Response delete(@PathParam("id") Long id) {
        service.delete(id);
        return Response.noContent().build();
    }
}
