'use strict';

describe('login page', () => {
  it('anonymous user should be able to log in', () => {
    cy.visit('/');
    cy.findByLabelText('Email')
      .type('user@example.org');
    cy.findByLabelText('Password')
      .type('Passw0rd!');
    cy.findByText('Log in')
      .click();
    cy.findByText(/app starter/i).should('exist');
  });
});
