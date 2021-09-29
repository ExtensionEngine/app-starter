'use strict';

const { ACCEPTED, CONFLICT, NOT_FOUND } = require('http-status');
const { Sequelize, sequelize, User } = require('../common/database');
const { createError } = require('../common/errors');
const Datasheet = require('../common/datasheet');
const { generateUsers } = require('../common/helpers');
const map = require('lodash/map');
const pick = require('lodash/pick');

const { Op } = Sequelize;

const columns = {
  email: { header: 'Email', width: 30 },
  firstName: { header: 'First Name', width: 30 },
  lastName: { header: 'Last Name', width: 30 },
  role: { header: 'Role', width: 30 },
  message: { header: 'Error', width: 30 }
};
const inputAttrs = ['email', 'role', 'firstName', 'lastName'];

const createFilter = q => map(['email', 'firstName', 'lastName'],
  it => ({ [it]: { [Op.iLike]: `%${q}%` } }));

async function list({ query: { email, role, filter }, options }, res) {
  const where = { [Op.and]: [] };
  if (filter) where[Op.or] = createFilter(filter);
  if (email) where[Op.and].push({ email });
  if (role) where[Op.and].push({ role });
  const { rows, count } = await User.findAndCountAll({ where, ...options });
  return res.jsend.success({ items: map(rows, 'profile'), total: count });
}

async function create({ body, origin }, res) {
  const options = { modelSearchKey: 'email' };
  const [err, user] = await User.restoreOrCreate(pick(body, inputAttrs), options);
  if (err) return createError(CONFLICT, 'User exists!');
  await User.invite(user, { origin });
  res.jsend.success(user.profile);
}

function patch({ params, body }, res) {
  return User.findByPk(params.id, { paranoid: false })
    .then(user => user || createError(NOT_FOUND, 'User does not exist!'))
    .then(user => user.update(pick(body, inputAttrs)))
    .then(user => res.jsend.success(user.profile));
}

async function destroy({ params }, res) {
  const transaction = await sequelize.transaction();
  const user = await User.findByPk(params.id, { transaction });
  if (!user) createError(NOT_FOUND);
  await user.destroy({ transaction });
  await transaction.commit();
  return res.end();
}

function login({ user }, res) {
  const token = user.createToken({ expiresIn: '5 days' });
  const data = { token, user: user.profile };
  res.json({ data });
}

function invite({ params, origin }, res) {
  return User.findByPk(params.id, { paranoid: false })
    .then(user => user || createError(NOT_FOUND, 'User does not exist!'))
    .then(user => User.invite(user, { origin }))
    .then(() => res.status(ACCEPTED).end());
}

function forgotPassword({ origin, body }, res) {
  const { email } = body;
  return User.findOne({ where: { email } })
    .then(user => user || createError(NOT_FOUND, 'User not found!'))
    .then(user => user.sendResetToken({ origin }))
    .then(() => res.end());
}

function resetPassword({ body }, res) {
  const { password, token } = body;
  return User.findOne({ where: { token } })
    .then(user => user || createError(NOT_FOUND, 'Invalid token!'))
    .then(user => {
      user.password = password;
      return user.save();
    })
    .then(() => res.end());
}

async function bulkImport(req, res, next) {
  const { file, origin } = req;
  const users = (await Datasheet.load(file)).toJSON({ include: inputAttrs });
  const errors = await bulkCreate(users, { origin });
  res.set('data-imported-count', users.length - errors.length);
  if (!errors.length) return res.end();
  const message = { header: 'Error', width: 30 };
  req.sheet = { columns: { ...columns, message }, data: errors };
  return next();
}

function getImportTemplate(req, _res, next) {
  req.sheet = { columns, data: generateUsers() };
  return next();
}

module.exports = {
  list,
  bulkImport,
  create,
  patch,
  destroy,
  login,
  invite,
  forgotPassword,
  resetPassword,
  getImportTemplate
};

async function bulkCreate(users, { concurrency = 16, ...options } = {}) {
  const errors = [];
  await User.restoreOrCreateAll(users, { concurrency, modelSearchKey: 'email' })
    .map(([err, user], index) => {
      if (!err && user) return User.invite(user, options);
      const { message = 'Failed to import user.' } = err;
      return errors.push({ ...users[index], message });
    }, { concurrency });
  return errors.length && errors;
}
