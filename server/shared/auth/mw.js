'use strict';

const { createError } = require('../errors');
const HttpStatus = require('http-status');
const { Role } = require('../../../common/config');

function authorize(...allowed) {
  allowed.push(Role.ADMIN);
  return ({ user }, res, next) => {
    if (!user) return createError(HttpStatus.UNAUTHORIZED, 'Access restricted');
    if (!allowed.includes(user.role)) {
      return createError(HttpStatus.FORBIDDEN, 'Access denied');
    }
    return next();
  };
}

module.exports = {
  authorize
};
