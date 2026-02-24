/// <reference types="cypress" />

describe("Raw Materials CRUD (RF006)", () => {
  beforeEach(() => {
    // Visit the materials page
    cy.visit("/materials");
  });

  it("Should display the materials overview", () => {
    cy.contains("Matérias Primas").should("be.visible");
    cy.contains("Adicionar Matéria Prima").should("be.visible");
  });

  it("Should open the creation dialog and validate required fields", () => {
    cy.contains("Adicionar Matéria Prima").click();
    cy.contains("Nova Matéria Prima").should("be.visible");

    // Submit early to trigger validation
    cy.contains("Salvar Material").click();
    cy.contains("O nome deve ter no mínimo 2 caracteres").should("be.visible");

    // Cancel the dialog
    cy.contains("Cancelar").click();
    cy.contains("Nova Matéria Prima").should("not.exist");
  });

  it("Should create a new Raw Material successfully", () => {
    const materialName = `Cypress Steel ${Date.now()}`;
    const qty = 50;

    cy.contains("Adicionar Matéria Prima").click();

    // Fill the inputs using Material UI name attributes
    cy.get('input[name="name"]').type(materialName);
    cy.get('input[name="stockQuantity"]').clear().type(qty.toString());

    // Intercept backend post req to wait for completion
    cy.intercept("POST", "/api/raw-materials").as("createResp");
    cy.contains("Salvar Material").click();

    // The react-hot-toast should pop up confirming
    cy.wait("@createResp");
    cy.contains("Matéria-prima criada com sucesso!").should("be.visible");

    // Verify it exists in the MUI Table
    cy.contains(materialName).should("exist");
    cy.contains(qty).should("exist");
  });
});
