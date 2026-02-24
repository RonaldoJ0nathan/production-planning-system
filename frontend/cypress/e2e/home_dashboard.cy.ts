/// <reference types="cypress" />

describe("Production Suggestions Dashboard (RF008)", () => {
  beforeEach(() => {
    // Visit the root URL
    cy.visit("/");
  });

  it("Should display the empty state when there are no producible recipes", () => {
    // Intercept and mock empty suggestions
    cy.intercept("GET", "/api/production-suggestions", {
      statusCode: 200,
      body: [],
    }).as("getEmptySuggestions");

    cy.wait("@getEmptySuggestions");
    
    // Check for standard dashboard headers
    cy.contains("Dashboard de Produção").should("be.visible");
    cy.contains("Nenhuma capacidade de produção").should("be.visible");
  });

  it("Should display production cards sorted by profitability", () => {
    // Mock suggestions with two items to test layout and sorting attributes
    const mockSuggestions = [
      {
        productId: 1,
        productName: "Cypress Wooden Table",
        productValue: 1200.5,
        producibleQuantity: 15,
        totalValue: 18007.5,
      },
      {
        productId: 2,
        productName: "Cypress Steel Chair",
        productValue: 350.0,
        producibleQuantity: 5,
        totalValue: 1750.0,
      }
    ];

    cy.intercept("GET", "/api/production-suggestions", {
      statusCode: 200,
      body: mockSuggestions,
    }).as("getSuggestions");

    // Visit again to ensure we don't hit cache from previous test
    cy.visit("/");
    cy.wait("@getSuggestions");

    // Check if the top profitable item renders the exclusive "Mais Rentável" chip
    cy.contains("Cypress Wooden Table").should("be.visible");
    cy.contains("Mais Rentável").should("be.visible");
    cy.contains("15 unidades").should("be.visible");
    cy.contains("R$ 18007.50").should("be.visible");

    // Check second item
    cy.contains("Cypress Steel Chair").should("be.visible");
    cy.contains("5 unidades").should("be.visible");
  });
});
