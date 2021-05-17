'use strict';

const { authenticate } = require('../common/auth');
const { createSheet } = require('../common/helpers');
const ctrl = require('./user.controller');
const multer = require('multer');
const router = require('express').Router();

const isString = arg => typeof arg === 'string';
const upload = multer({ storage: multer.memoryStorage() });

router
  .post('/login', authenticate('local'), normalizeEmail, ctrl.login)
  .post('/forgot-password', normalizeEmail, ctrl.forgotPassword)
  .post('/reset-password', authenticate('token'), normalizeEmail, ctrl.resetPassword);

router.use(authenticate('jwt'));

router.route('/')
  .get(ctrl.list)
  .post(ctrl.create);

router.route('/:id')
  .patch(ctrl.patch)
  .delete(ctrl.destroy);

router
  .post('/:id/invite', ctrl.invite)
  .post('/import', upload.single('file'), ctrl.bulkImport, createSheet)
  .get('/import/template', ctrl.getImportTemplate, createSheet);

module.exports = {
  path: '/users',
  router
};

function normalizeEmail(req, _res, next) {
  const { body } = req;
  if (isString(body.email)) body.email = body.email.toLowerCase();
  next();
}
