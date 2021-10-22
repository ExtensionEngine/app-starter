'use strict';

const seed = require('../../actions/seed');

const user = Cypress.env('USER_EMAIL');
const userPassword = Cypress.env('USER_PASSWORD');
const admin = Cypress.env('ADMIN_EMAIL');
const adminPassword = Cypress.env('ADMIN_PASSWORD');

describe('Login Test', () => {
  beforeEach(() => {
    seed('users');
  });
  it('Logins as User', function () {
    cy.visit('/');
    cy.findByLabelText('Email').type(user);
    cy.findByLabelText('Password').type(userPassword);
    cy.findByText('Log in').click();
    cy.findByText(/APP STARTER/i).should('exist');
  });
  it('Logins as Admin', function () {
    cy.visit('/');
    cy.findByLabelText('Email').type(admin);
    cy.findByLabelText('Password').type(adminPassword);
    cy.findByText('Log in').click();
    cy.findByText(/STARTER/i).should('exist');
  });
});
