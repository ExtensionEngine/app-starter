'use strict';

const user = Cypress.env('USER_EMAIL');

describe('Reset Password Test', () => {
  it('Resets password', function () {
    cy.visit('/');
    cy.findByText('Forgot password?').click();
    cy.findByLabelText('Email').type(user);
    cy.findByText(/send reset email/i).click();
    cy.findByText('Reset email sent').should('exist');
  });
});
