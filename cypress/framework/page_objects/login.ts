import login from '../selectors';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function loginToPage(emailUser1, password) {
  cy.xpath((login as any).email).type(emailUser1);
  cy.xpath((login as any).password).type(password);
}

export default {
  loginToPage
};
