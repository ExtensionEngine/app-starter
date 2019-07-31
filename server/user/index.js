'use strict';

const { authenticate } = require('../common/auth');
const ctrl = require('./user.controller');
const multer = require('multer');
const router = require('express').Router();

const isString = arg => typeof arg === 'string';
const upload = multer({ storage: multer.memoryStorage() });

router
  .post('/login', authenticate('local'), normalizeEmail, ctrl.login)
  .post('/forgotPassword', normalizeEmail, ctrl.forgotPassword)
  .post('/resetPassword', normalizeEmail, ctrl.resetPassword)
  .use(authenticate('jwt'))
  .get('/', ctrl.list)
  .post('/', ctrl.create)
  .patch('/:id', ctrl.patch)
  .delete('/:id', ctrl.destroy)
  .post('/:id/invite', ctrl.invite)
  .post('/import', upload.single('file'), ctrl.bulkImport);

module.exports = {
  path: '/users',
  router
};

function normalizeEmail(req, _res, next) {
  const { body } = req;
  if (isString(body.email)) body.email = body.email.toLowerCase();
  next();
}
