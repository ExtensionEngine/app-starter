'use strict';

const { loginAdmin, loginUser } = require('../../actions/login');
const seed = require('../../actions/seed');

describe('Logout', () => {
  beforeEach(() => {
    seed('users');
  });

  it('User should be able to log out', () => {
    loginUser();
    cy.visit('/');
    cy.findByText(/User ? Example/i).click();
    cy.findByText('Logout').click();
    cy.findByText('Log in').should('exist');
  });

  it('Admin should be able to log out', () => {
    loginAdmin();
    cy.visit('/');
    cy.findByTestId(/navbar-avatar-Admin Example/i).click();
    cy.findByText('Logout').click();
    cy.findByText('Log in').should('exist');
  });
});
