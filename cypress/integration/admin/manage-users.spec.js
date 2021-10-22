'use strict';

const { loginAdmin } = require('../../actions/login');
const seed = require('../../actions/seed');

describe('Manage users', () => {
  beforeEach(() => {
    seed('users');
    loginAdmin();
  });

  it('Should add user', function () {
    const addUserFormId = 'add-user-form';
    cy.visit('/');
    cy.findByText(/Add User/i).click();
    cy.findByTestId(addUserFormId).within(() => {
      cy.findByLabelText('Email').type('test@example.org');
      cy.findByLabelText('Role').click({ force: true });
    });
    cy.root()
      .get('[role="option"]')
      .contains('User')
      .click();
    cy.findByTestId(addUserFormId).within(() => {
      cy.findByLabelText('First Name').type('First Name');
      cy.findByLabelText('Last Name').type('Last Name');
      cy.findByText(/Save/i).click();
    });
    cy.findByText('test@example.org').should('exist');
  });
});
