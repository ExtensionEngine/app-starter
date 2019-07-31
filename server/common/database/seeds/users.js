'use strict';

const { auth: config = {} } = require('../../../config');
const bcrypt = require('bcrypt');
const { role } = require('../../../../common/config');

const hash = password => bcrypt.hashSync(password, config.saltRounds);

const now = new Date();
const users = [{
  first_name: 'Admin',
  last_name: 'Example',
  email: 'admin@example.org',
  password: hash('admin123'),
  role: role.ADMIN,
  created_at: now,
  updated_at: now
}, {
  first_name: 'User',
  last_name: 'Example',
  email: 'user@example.org',
  password: hash('user123'),
  role: role.USER,
  created_at: now,
  updated_at: now
}];

exports.up = queryInterface => queryInterface.bulkInsert('user', users);
exports.down = queryInterface => queryInterface.bulkInsert('user', null);
