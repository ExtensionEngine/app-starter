'use strict';

describe('Add User Test', () => {
  it('Opens website', function () {
    cy.visit(this.config.localServerURL);
  });

  it('Types in email and password', function () {
    cy.findByLabelText('Email').type(this.data.adminEmail);
    cy.findByLabelText('Password').type(this.data.password);
  });

  it('Clicks login', function () {
    cy.findByText('Log in').click();
  });

  it('Verifies dashboard visible', function () {
    cy.findByText(/STARTER/i).should('exist');
  });

  it('Finds add user button and clicks it', function () {
    cy.findByText(/Add User/i).click();
    cy.findByText(/Create user/i).should('exist');
  });

  it('Inserts new user data', function () {
    cy.findByLabelText('Email').type('test@ee.com');
    cy.get('div[role="button"]').contains('Role').click({ force: true });
    cy.get('div[role="listbox"]').contains('User').click({ force: true });
    cy.findByLabelText('First Name').type('First Name');
    cy.findByLabelText('Last Name').type('Last Name');
    cy.findByText(/Save/i).click();
  });
  /*
  it('Verifies user added', function () {
    cy.findByText('test@ee.com').should('exist');
  });
  */
});
