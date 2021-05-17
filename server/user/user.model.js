'use strict';

const { Model, Op, Sequelize, UniqueConstraintError } = require('sequelize');
const bcrypt = require('bcrypt');
const castArray = require('lodash/castArray');
const compact = require('lodash/compact');
const { auth: config = {} } = require('../config');
const find = require('lodash/find');
const jwt = require('jsonwebtoken');
const mail = require('../common/mail');
const map = require('lodash/map');
const pick = require('lodash/pick');
const Promise = require('bluebird');
const { restoreOrCreate } = require('../common/database/restore');
const { Role } = require('../../common/config');
const { sql } = require('../common/database/helpers');
const logger = require('../common/logger')();

const PROFILE_ATTRS = [
  'id', 'firstName', 'lastName', 'fullName', 'label', 'email',
  'role', 'createdAt', 'deletedAt'
];

class User extends Model {
  static fields({ DATE, ENUM, STRING, VIRTUAL }) {
    return {
      email: {
        type: STRING,
        set(email) {
          this.setDataValue('email', email.toLowerCase());
        },
        allowNull: false,
        validate: { isEmail: true, notEmpty: true },
        unique: { msg: 'This email address is already in use.' }
      },
      password: {
        type: STRING,
        validate: { notEmpty: true, len: [5, 255] }
      },
      role: {
        type: ENUM(Object.values(Role)),
        allowNull: false,
        defaultValue: Role.User
      },
      token: {
        type: STRING,
        validate: { notEmpty: true, len: [10, 500] }
      },
      firstName: {
        type: STRING,
        field: 'first_name'
      },
      lastName: {
        type: STRING,
        field: 'last_name'
      },
      fullName: {
        type: VIRTUAL,
        get() {
          return compact([this.firstName, this.lastName]).join(' ') || null;
        }
      },
      label: {
        type: VIRTUAL,
        get() {
          return this.fullName || this.email;
        }
      },
      createdAt: {
        type: DATE,
        field: 'created_at'
      },
      updatedAt: {
        type: DATE,
        field: 'updated_at'
      },
      deletedAt: {
        type: DATE,
        field: 'deleted_at'
      },
      profile: {
        type: VIRTUAL,
        get() {
          return pick(this, PROFILE_ATTRS);
        }
      }
    };
  }

  static get text() {
    return sql.concat(
      Sequelize.col('email'),
      Sequelize.col('first_name'),
      Sequelize.col('last_name'),
      { separator: ' ' }
    );
  }

  static options() {
    return {
      modelName: 'user',
      timestamps: true,
      paranoid: true,
      freezeTableName: true
    };
  }

  static hooks(Hooks) {
    return {
      [Hooks.beforeCreate]: user => user.encryptPassword(),
      [Hooks.beforeUpdate]: user => user.encryptPassword(),
      [Hooks.beforeBulkCreate]: users => {
        return Promise.all(users.map(user => user.encryptPassword()));
      }
    };
  }

  static scopes() {
    return {
      searchByPattern(pattern) {
        const cond = { [Op.iLike]: `%${pattern}%` };
        const where = sql.where(this.text, cond, { scope: true });
        return { where };
      }
    };
  }

  static async restoreOrCreate(user, options) {
    return restoreOrCreate(this, user, options);
  }

  static match(pattern) {
    if (!pattern) return User;
    return User.scope({ method: ['searchByPattern', pattern] });
  }

  static async invite(user, options) {
    user.token = user.createToken({ expiresIn: '3 days' });
    mail.invite(user, options).catch(err =>
      logger.error('Error: Sending invite email failed:', err.message));
    return user.save({ paranoid: false });
  }

  static async import(users, { concurrency = 16, ...options } = {}) {
    const errors = [];
    await this.restoreOrBuild(users, { concurrency }).map((result, i) => {
      if (result.isFulfilled()) return this.invite(result.value(), options);
      const { message = 'Failed to import user.' } = result.reason();
      return errors.push({ ...users[i], message });
    }, { concurrency });
    return errors.length && errors;
  }

  static async restoreOrBuild(users, { concurrency = 16 } = {}) {
    users = castArray(users);
    const where = { email: map(users, 'email') };
    const found = await User.findAll({ where, paranoid: false });
    return Promise.map(users, userData => Promise.try(() => {
      const user = find(found, { email: userData.email });
      if (user && !user.deletedAt) {
        const message = this.rawAttributes.email.unique.msg;
        throw new UniqueConstraintError({ message });
      }
      if (user) {
        user.setDataValue('deleteAt', null);
        return user;
      }
      return this.build(userData);
    }).reflect(), { concurrency });
  }

  async encryptPassword() {
    if (!this.password) return false;
    if (!this.changed('password')) return this;
    this.password = await bcrypt.hash(this.password, config.saltRounds);
    return this;
  }

  async authenticate(password) {
    if (!this.password) return false;
    const isValid = await bcrypt.compare(password, this.password);
    return isValid ? this : false;
  }

  sendResetToken(options) {
    this.token = this.createToken({ expiresIn: '5 days' });
    mail.resetPassword(this, options).catch(err =>
      logger.error('Error: Sending reset password email failed:', err.message));
    return this.save();
  }

  createToken(options = {}) {
    const payload = { id: this.id, email: this.email };
    Object.assign(options, { issuer: config.issuer });
    return jwt.sign(payload, config.secret, options);
  }

  isAdmin() {
    return this.role === Role.Admin;
  }
}

module.exports = User;
