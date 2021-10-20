'use strict';
const { dashboard } = require('../selectors');

function isAppStarterVisible() {
  cy.xpath(dashboard.appStarter).should('be.visible');
}

module.exports = {
  isAppStarterVisible
};
