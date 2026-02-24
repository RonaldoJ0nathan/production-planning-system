package com.productionplanning.resource;

import com.productionplanning.dto.RawMaterialRequest;
import com.productionplanning.dto.RawMaterialResponse;
import com.productionplanning.service.RawMaterialService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

@Path("/api/raw-materials")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Raw Materials", description = "CRUD operations for raw materials")
public class RawMaterialResource {

    @Inject
    RawMaterialService service;

    @GET
    @Operation(summary = "List all raw materials")
    public List<RawMaterialResponse> findAll() {
        return service.findAll();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get a raw material by ID")
    public RawMaterialResponse findById(@PathParam("id") Long id) {
        return service.findById(id);
    }

    @POST
    @Operation(summary = "Create a new raw material")
    public Response create(@Valid RawMaterialRequest request) {
        RawMaterialResponse response = service.create(request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update an existing raw material")
    public RawMaterialResponse update(@PathParam("id") Long id, @Valid RawMaterialRequest request) {
        return service.update(id, request);
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete a raw material by ID")
    public Response delete(@PathParam("id") Long id) {
        service.delete(id);
        return Response.noContent().build();
    }
}
