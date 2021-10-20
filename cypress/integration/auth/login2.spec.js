'use strict';
const { dashboard, login } = require('../../framework/pages');

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

  it('Verifies dashboard visible', function () {
    dashboard.isAppStarterVisible();
  });
});
