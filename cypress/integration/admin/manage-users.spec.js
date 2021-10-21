'use strict';

const { loginAdmin } = require('../../actions/login');

describe('Manage users', () => {
  beforeEach(() => {
    loginAdmin();
  });

  it('should add user', function () {
    cy.visit('/');
    cy.findByText(/Add User/i).click();
    cy.findByText(/Create user/i).should('exist');
    cy.findByLabelText('Email').type('test@ee.com');
    cy.get('div[role="button"]').contains('Role').click({ force: true });
    cy.get('div[role="listbox"]').contains('User').click({ force: true });
    cy.findByLabelText('First Name').type('First Name');
    cy.findByLabelText('Last Name').type('Last Name');
    cy.findByText(/Save/i).click();
  });
});
