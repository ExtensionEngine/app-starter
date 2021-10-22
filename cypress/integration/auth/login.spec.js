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

  it('User should be able to log in', () => {
    cy.visit('/');
    cy.findByLabelText('Email').type(user);
    cy.findByLabelText('Password').type(userPassword);
    cy.findByText('Log in').click();
    cy.findByText(/APP STARTER/i).should('exist');
  });

  it('Admin should be able to log in', function () {
    cy.visit('/');
    cy.findByLabelText('Email').type(admin);
    cy.findByLabelText('Password').type(adminPassword);
    cy.findByText('Log in').click();
    cy.findByText(/STARTER/i).should('exist');
  });
});
