'use strict';

const { createError } = require('../common/errors');
const { Sequelize, sequelize, User } = require('../common/database');
const Datasheet = require('./datasheet');
const HttpStatus = require('http-status');
const mime = require('mime');
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

function list({ query: { email, role, filter }, options }, res) {
  const where = { [Op.and]: [] };
  if (filter) where[Op.or] = createFilter(filter);
  if (email) where[Op.and].push({ email });
  if (role) where[Op.and].push({ role });
  return User.findAndCountAll({ where, ...options }).then(({ rows, count }) => {
    return res.jsend.success({ items: map(rows, 'profile'), total: count });
  });
}

function create(req, res) {
  const { body, origin } = req;
  return User.restoreOrBuild(pick(body, inputAttrs))
    .then(([result]) => {
      if (result.isRejected()) return createError(HttpStatus.CONFLICT);
      return User.invite(result.value(), { origin });
    })
    .then(user => res.jsend.success(user.profile));
}

function patch({ params, body }, res) {
  return User.findByPk(params.id, { paranoid: false })
    .then(user => user || createError(HttpStatus.NOT_FOUND, 'User does not exist!'))
    .then(user => user.update(pick(body, inputAttrs)))
    .then(user => res.jsend.success(user.profile));
}

function destroy({ params }, res) {
  sequelize.transaction(async transaction => {
    const user = await User.findByPk(params.id, { transaction });
    if (!user) createError(HttpStatus.NOT_FOUND);
    await user.destroy({ transaction });
    res.end();
  });
}

function login({ user }, res) {
  const token = user.createToken({ expiresIn: '5 days' });
  const data = { token, user: user.profile };
  res.json({ data });
}

function invite({ params, origin }, res) {
  return User.findByPk(params.id, { paranoid: false })
    .then(user => user || createError(HttpStatus.NOT_FOUND, 'User does not exist!'))
    .then(user => User.invite(user, { origin }))
    .then(() => res.status(HttpStatus.ACCEPTED).end());
}

function forgotPassword({ origin, body }, res) {
  const { email } = body;
  return User.findOne({ where: { email } })
    .then(user => user || createError(HttpStatus.NOT_FOUND, 'User not found!'))
    .then(user => user.sendResetToken({ origin }))
    .then(() => res.end());
}

function resetPassword({ body, params }, res) {
  const { password, token } = body;
  return User.findOne({ where: { token } })
    .then(user => user || createError(HttpStatus.NOT_FOUND, 'Invalid token!'))
    .then(user => {
      user.password = password;
      return user.save();
    })
    .then(() => res.end());
}

async function bulkImport({ body, file, origin }, res) {
  const users = (await Datasheet.load(file)).toJSON({ include: inputAttrs });
  const errors = await User.import(users, { origin: origin });
  if (!errors) return res.end();
  const creator = 'APP_STARTER';
  const format = body.format || mime.getExtension(file.mimetype);
  const report = (new Datasheet({ columns, data: errors })).toWorkbook({ creator });
  return report.send(res, { format });
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
  resetPassword
};
