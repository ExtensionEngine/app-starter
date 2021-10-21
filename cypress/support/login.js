'use strict';

Cypress.Commands.add('login', (email, password) => {
  const log = Cypress.log({
    displayName: 'LOGIN',
    message: [`🔐 Authenticating | ${email}`],
    autoEnd: false
  });
  log.snapshot('before');

  login({ email, password }).then(({ body }) => {
    saveToLocalStorage('TOKEN', body.data.token);
    log.snapshot('after');
    log.end();
  });
});

function login(credentials) {
  return cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: credentials
  });
}

function saveToLocalStorage(key, value) {
  window.localStorage.setItem(key, value);
}
