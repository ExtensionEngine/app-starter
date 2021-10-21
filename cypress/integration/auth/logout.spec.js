'use strict';

const { loginAdmin, loginUser } = require('../../actions/login');
const seed = require('../../actions/seed');

describe('Logout', () => {
  beforeEach(() => {
    seed('users');
  });

  it('Logout as User', function () {
    loginUser();
    cy.visit('/');
    cy.findByText(/User ? Example/i).click();
    cy.findByText('Logout').click();
    cy.findByText('Log in').should('exist');
  });

  it('Logout as Admin', function () {
    loginAdmin();
    cy.visit('/');
    cy.findByTestId(/Admin Example/i).click();
    cy.findByText('Logout').click();
    cy.findByText('Log in').should('exist');
  });
});
