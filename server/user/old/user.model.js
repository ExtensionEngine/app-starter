'use strict';
/* eslint-disable */
const { getWorkspaceDomain, isAdmin, isStaff, isUrl } = require('../../common/utils');
const { Model, Op, Sequelize } = require('../common/database/sqlize');
const Audience = require('../common/auth/audience');
const { auth: authConfig = {} } = require('../config');
const compact = require('lodash/compact');
const config = require('../../common/config');
const groupBy = require('lodash/groupBy');
const jwt = require('jsonwebtoken');
const { LearningCoach } = require('../maestro/maestro.types');
const map = require('lodash/map');
const Promise = require('bluebird');
const { restoreOrCreate } = require('../common/database/restore');
const schemas = require('./user.schemas');
const sortBy = require('lodash/sortBy');
const { sql } = require('../common/database/helpers');

class User extends Model {
  static fields({ DATE, ENUM, INTEGER, STRING, VIRTUAL }) {
    return {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        importReadOnly: true
      },
      email: {
        type: STRING,
        set(email) {
          this.setDataValue('email', email.toLowerCase());
        },
        allowNull: false,
        validate: { isEmail: true, notEmpty: true },
        unique: { msg: 'This email address is already in use.' },
        importReadOnly: true
      },
      role: {
        type: ENUM(Object.values(Role)),
        allowNull: false,
        defaultValue: Role.USER
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

  static match(pattern) {
    if (!pattern) return User;
    return User.scope({ method: ['searchByPattern', pattern] });
  }

  createToken(options = {}) {
    const payload = { id: this.id, email: this.email };
    Object.assign(options, {
      issuer: authConfig.jwt.issuer,
      audience: options.audience || Audience.Scope.Access
    });
    return jwt.sign(payload, this.getTokenSecret(options.audience), options);
  }

  getTokenSecret(audience) {
    const { secret } = authConfig.jwt;
    if (audience === Audience.Scope.Access) return secret;
    return [secret, this.idpId, this.updatedAt.getTime()].join('');
  }

  isAdmin() {
    return isAdmin(this);
  }

  static async invite(user, options) {
    user.token = user.createToken({
      audience: Audience.Scope.Setup,
      expiresIn: '5 days'
    });
    mail.invite(user, options).catch(err =>
      logger.error('Error: Sending invite email failed:', err.message));
    return user.save({ paranoid: false });
  }

  sendResetToken(options) {
    this.token = this.createToken({
      audience: Audience.Scope.Setup,
      expiresIn: '5 days'
    });
    mail.resetPassword(this, options).catch(err =>
      logger.error('Error: Sending reset password email failed:', err.message));
    return this.save();
  }
}

module.exports = User;
