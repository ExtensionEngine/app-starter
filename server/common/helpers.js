'use strict';

const Datasheet = require('./datasheet');
const { importTemplateFormat } = require('../config');
const mime = require('mime');
const { Role } = require('../../common/config');

const times = (length, cb) => Array.from({ length }, (_, i) => cb(i));

function generateUsers() {
  const users = [{
    firstName: 'Admin',
    lastName: 'Example',
    email: 'admin@example.org',
    role: Role.ADMIN
  }];
  times(10, i => {
    const suffix = i || '';
    users.push({
      firstName: `User ${suffix}`,
      lastName: 'Example',
      email: `user${suffix}@example.org`,
      role: Role.USER
    });
  });
  return users;
}

function createSheet({ sheet, body, file = {} }, res) {
  const creator = 'Boutique';
  const report = (new Datasheet(sheet)).toWorkbook({ creator });
  const format = body.format || mime.getExtension(file.mimetype) || importTemplateFormat;
  return report.send(res, { format });
}

module.exports = { createSheet, generateUsers };
