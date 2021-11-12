'use strict';

function seed(resource) {
  cy.exec(`npm run db:seed ${resource}`);
}

module.exports = seed;
