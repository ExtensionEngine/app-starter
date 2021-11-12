'use strict';

const seed = require('../../actions/seed');
const user = Cypress.env('USER_EMAIL');

describe('Reset password page', () => {
  beforeEach(() => {
    seed('users');
  });

  it('should send reset password email', () => {
    cy.visit('/');
    cy.findByText('Forgot password?').click();
    cy.findByLabelText('Email').type(user);
    cy.findByText(/send reset email/i).click();
    cy.findByText('Reset email sent').should('exist');
  });
});
