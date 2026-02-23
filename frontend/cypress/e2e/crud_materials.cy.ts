/// <reference types="cypress" />

describe('Raw Materials CRUD (RF006)', () => {
  beforeEach(() => {
    // Visit the materials page
    cy.visit('/materials');
  });

  it('Should display the materials overview', () => {
    cy.contains('Raw Materials').should('be.visible');
    cy.contains('Add Material').should('be.visible');
  });

  it('Should open the creation dialog and validate required fields', () => {
    cy.contains('Add Material').click();
    cy.get('div[role="dialog"]').should('be.visible');
    cy.contains('New Raw Material').should('be.visible');

    // Submit early to trigger validation
    cy.contains('Save Material').click();
    cy.contains('Name must be at least 2 characters').should('be.visible');
    cy.contains('Quantity cannot be negative').should('be.visible');
    
    // Cancel the dialog
    cy.contains('Cancel').click();
    cy.get('div[role="dialog"]').should('not.exist');
  });

  it('Should create a new Raw Material successfully', () => {
    const materialName = `Cypress Steel ${Date.now()}`;
    const qty = 50;

    cy.contains('Add Material').click();
    
    // Fill the inputs using Material UI name attributes
    cy.get('input[name="name"]').type(materialName);
    cy.get('input[name="stockQuantity"]').clear().type(qty.toString());
    
    // Intercept backend post req to wait for completion
    cy.intercept('POST', '/api/raw-materials').as('createResp');
    cy.contains('Save Material').click();

    // The react-hot-toast should pop up confirming
    cy.wait('@createResp');
    cy.contains('Raw material created successfully!').should('be.visible');

    // Verify it exists in the MUI Table
    cy.contains(materialName).should('exist');
    cy.contains(qty).should('exist');
  });
});
