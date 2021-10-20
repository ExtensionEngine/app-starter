'use strict';
const { login } = require('../../framework/pages');

describe('Login Test', () => {
  it('Opens website', function () {
    cy.visit(this.config.localServerURL);
  });

  it('Types in email and password', function () {
    login.loginToPage(this.data.email, this.data.password);
  });

  it('Clicks login', function () {
    cy.findByText('Log in').click();
  });
});
