/// <reference types="cypress" />

describe("Products & Recipe CRUD (RF005, RF007)", () => {
  beforeEach(() => {
    // Visit the products page
    cy.visit("/products");
  });

  it("Should display the products overview and table", () => {
    cy.contains("Produtos").should("be.visible");
    cy.contains("Adicionar Produto").should("be.visible");
  });

  it("Should validate required fields on the product creation wizard", () => {
    cy.contains("Adicionar Produto").click();
    cy.get('div[role="dialog"]').should("be.visible");
    cy.contains("Novo Produto").should("be.visible");

    // Click next without filling the form
    cy.contains("Salvar e Ver Receita").click();
    cy.contains("O nome deve ter no mínimo 2 caracteres").should("be.visible");
    cy.contains("O valor deve ser maior que zero").should("be.visible");

    // Cancel the dialog
    cy.get('button').contains("Cancelar").click();
    cy.contains("Novo Produto").should("not.exist");
  });

  it("Should create a product and navigate to the recipe (Step 2)", () => {
    const productName = `Cadeira de Teste ${Date.now()}`;
    const productValue = 250;

    // We mock the materials query so the recipe select box isn't empty
    cy.intercept("GET", "/api/raw-materials", {
      statusCode: 200,
      body: [{ id: 999, name: "Madeira Fictícia Cypress", stockQuantity: 100 }],
    }).as("getMaterials");

    // Mock the post request for the product
    cy.intercept("POST", "/api/products", {
      statusCode: 201,
      body: { id: 888, name: productName, value: productValue },
    }).as("createProduct");

    cy.contains("Adicionar Produto").click();
    cy.get('input[name="name"]').type(productName);
    cy.get('input[name="value"]').clear().type(productValue.toString());

    cy.contains("Salvar e Ver Receita").click();
    cy.wait("@createProduct");
    cy.wait("@getMaterials");

    // Verify stepper transition text and elements
    cy.contains("Produto criado!").should("be.visible");
    cy.contains("Receita de Produção (Opcional)").should("be.visible");
    cy.contains("Nenhum material vinculado ainda").should("be.visible");

    // Test finishing configuration with empty associations
    // Cypress requires force click or specific selector if disabled standard button blocks it, 
    // but we can just check if it renders the "Concluir Definição" disabled State
    cy.contains("Concluir Definição").should("be.disabled");

    cy.get('button').contains("Fechar").click();
    cy.contains("Novo Produto").should("not.exist");
  });
});
