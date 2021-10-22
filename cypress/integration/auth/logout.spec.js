'use strict';

const { loginAdmin, loginUser } = require('../../actions/login');

describe('Logout', () => {
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
    cy.get('.v-avatar').click();
    cy.findByText('Logout').click();
    cy.findByText('Log in').should('exist');
  });
});
