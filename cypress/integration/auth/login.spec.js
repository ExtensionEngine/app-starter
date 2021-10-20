'use strict';

describe('Login Test', () => {
  it('Opens website', function () {
    cy.visit(this.config.localServerURL);
  });

  it('Types in email and password', function () {
    cy.findByLabelText('Email').type(this.data.email);
    cy.findByLabelText('Password').type(this.data.password);
  });

  it('Clicks login', function () {
    cy.findByText('Log in').click();
  });

  it('Verifies dashboard visible', function () {
    cy.findByText(/APP STARTER/i).should('exist');
  });
});
