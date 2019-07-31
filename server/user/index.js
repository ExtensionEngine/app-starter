'use strict';

const auth = require('../common/auth').authenticate('jwt');
const ctrl = require('./user.controller');
const multer = require('multer');
const router = require('express').Router();

const isString = arg => typeof arg === 'string';
const upload = multer({ storage: multer.memoryStorage() });

router
  .post('/login', normalizeEmail, ctrl.login)
  .post('/forgotPassword', normalizeEmail, ctrl.forgotPassword)
  .post('/resetPassword', normalizeEmail, ctrl.resetPassword)
  .use(auth)
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
