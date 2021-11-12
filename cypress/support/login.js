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
    saveToLocalStorage('APP_USER', JSON.stringify(body.data.user));
    log.snapshot('after');
    log.end();
  });
});

function login(credentials) {
  const serverUrl = Cypress.env('SERVER_URL');
  const url = new URL('api/auth/login', serverUrl);
  return cy.request({
    method: 'POST',
    url: url.href,
    body: credentials
  });
}

function saveToLocalStorage(key, value) {
  window.localStorage.setItem(key, value);
}
