'use strict';

const { loginAdmin, loginUser } = require('../../actions/login');
const seed = require('../../actions/seed');

describe('Logout', () => {
  beforeEach(() => {
    seed('users');
  });

  it('User should be able to log out', function () {
    loginUser();
    cy.visit('/');
    cy.findByText(/User ? Example/i).click();
    cy.findByText('Logout').click();
    cy.findByText('Log in').should('exist');
  });

  it('Admin should be able to log out', function () {
    loginAdmin();
    cy.visit('/');
    cy.findByTestId(/Admin Example/i).click();
    cy.findByText('Logout').click();
    cy.findByText('Log in').should('exist');
  });
});
