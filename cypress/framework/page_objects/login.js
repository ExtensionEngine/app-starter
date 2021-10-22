'use strict';
const { login } = require('../selectors');

function loginToPage(email, password) {
  cy.xpath(login.email).type(email);
  cy.xpath(login.password).type(password);
}

module.exports = {
  loginToPage
};
