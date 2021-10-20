'use strict';

describe('Reset Password Test', () => {
  it('Opens website', function () {
    cy.visit(this.config.localServerURL);
  });

  it('Clicks on reset password', function () {
    cy.findByText('Forgot password?').click();
  });

  it('Types in email', function () {
    cy.findByLabelText('Email').type(this.data.email);
  });

  it('Clicks on send reset mail', function () {
    cy.findByText(/send reset email/i).click();
  });

  it('Verifies email sent', function () {
    cy.findByText('Reset email sent').should('exist');
  });
});
