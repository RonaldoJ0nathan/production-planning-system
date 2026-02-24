package com.productionplanning.resource;

import com.productionplanning.dto.ProductionSuggestionResponse;
import com.productionplanning.service.ProductionSuggestionService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

@Path("/api/production-suggestions")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Production Suggestions", description = "Calculate which products can be produced with current stock")
public class ProductionSuggestionResource {

    @Inject
    ProductionSuggestionService service;

    @GET
    @Operation(
        summary = "Get production suggestions",
        description = "Returns a list of products that can be produced with the current raw material stock, " +
                      "prioritized by product value (highest first). " +
                      "Each entry includes the producible quantity and the total revenue value."
    )
    public List<ProductionSuggestionResponse> suggest() {
        return service.suggest();
    }
}
