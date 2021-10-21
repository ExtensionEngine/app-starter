'use strict';

const user = Cypress.env('USER_EMAIL');
const seed = require('../../actions/seed');

describe('Reset Password Test', () => {
  beforeEach(() => {
    seed('users');
  });

  it('Resets password', function () {
    cy.visit('/');
    cy.findByText('Forgot password?').click();
    cy.findByLabelText('Email').type(user);
    cy.findByText(/send reset email/i).click();
    cy.findByText('Reset email sent').should('exist');
  });
});
