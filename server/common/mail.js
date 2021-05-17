'use strict';

const { email: config, origin } = require('../config');
const logger = require('./logger')('mailer');
const pick = require('lodash/pick');
const { promisify } = require('util');
const { SMTPClient } = require('emailjs');
const { URL } = require('url');

const from = `${config.sender.name} <${config.sender.address}>`;
const server = new SMTPClient(config);
logger.info(getConfig(server), '📧  SMTP client created');

const send = promisify(server.send.bind(server));

const resetUrl = token => `${origin}/#/auth/reset-password/${token}`;

module.exports = {
  send,
  invite,
  resetPassword
};

function invite(user, token) {
  const href = resetUrl(token);
  const { hostname } = new URL(href);
  const recipient = user.email;
  const message = `
    An account has been created for you on ${hostname}.
    Please click <a href="${href}">here</a> to complete your registration.`;

  logger.info({ recipient, sender: from }, '📧  Sending invite email to:', recipient);
  return send({
    from,
    to: recipient,
    subject: 'Invite',
    attachment: [{ data: `<html>${message}</html>`, alternative: true }]
  });
}

function resetPassword(user, token) {
  const href = resetUrl(token);
  const recipient = user.email;
  const message = `
    You requested password reset.
    Please click <a href="${href}">here</a> to complete the reset process.`;

  logger.info({ recipient, sender: from }, '📧  Sending reset password email to:', recipient);
  return send({
    from,
    to: recipient,
    subject: 'Reset password',
    attachment: [{ data: `<html>${message}</html>`, alternative: true }]
  });
}

function getConfig(server) {
  // NOTE: List public keys: https://git.io/fxV4j
  return pick(server.smtp, [
    'host', 'port', 'domain',
    'authentication', 'ssl', 'tls',
    'timeout'
  ]);
}
