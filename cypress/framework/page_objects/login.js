import { login } from '../selectors';

function loginToPage(emailUser1, password) {
  cy.xpath(login.email).type(emailUser1);
  cy.xpath(login.password).type(password);
}

export default {
  loginToPage,
};
