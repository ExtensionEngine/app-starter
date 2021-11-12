'use strict';

function loginUser() {
  const username = Cypress.env('USER_EMAIL');
  const password = Cypress.env('USER_PASSWORD');
  cy.login(username, password);
}

function loginAdmin() {
  const username = Cypress.env('ADMIN_EMAIL');
  const password = Cypress.env('ADMIN_PASSWORD');
  cy.login(username, password);
}

module.exports = { loginUser, loginAdmin };
