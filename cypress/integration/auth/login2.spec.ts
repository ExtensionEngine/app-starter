import login from '../../framework/pages';

describe('Login Test', () => {
  it('Opens website', function () {
    cy.visit(this.config.localServerURL);
  });

  it('Login', function () {
    (login as any).loginToPage(this.data.email, this.data.password);
  });
});
