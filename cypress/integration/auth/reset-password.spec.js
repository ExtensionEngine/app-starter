'use strict';

const seed = require('../../actions/seed');
const user = Cypress.env('USER_EMAIL');

describe('Reset Password Test', () => {
  beforeEach(() => {
    seed('users');
  });

  it('Resets password', () => {
    cy.visit('/');
    cy.findByText('Forgot password?').click();
    cy.findByLabelText('Email').type(user);
    cy.findByText(/send reset email/i).click();
    cy.findByText('Reset email sent').should('exist');
  });
});
