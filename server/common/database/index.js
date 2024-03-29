'use strict';

const config = require('./config');
const forEach = require('lodash/forEach');
const Hooks = require('./hooks');
const invoke = require('lodash/invoke');
const { migrationsPath } = require('../../../sequelize.config');
const logger = require('../logger')('db');
const pick = require('lodash/pick');
const pkg = require('../../../package.json');
const result = require('lodash/result');
const semver = require('semver');
const Sequelize = require('sequelize');
const Umzug = require('umzug');
const { wrapAsyncMethods } = require('./helpers');

// Require models.
// eslint-disable-next-line require-sort/require-sort
const User = require('../../user/user.model');

const isProduction = process.env.NODE_ENV === 'production';
const sequelize = createConnection(config);

function initialize() {
  const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: {
      sequelize,
      tableName: config.migrationStorageTableName
    },
    migrations: {
      params: [sequelize.getQueryInterface(), sequelize.Sequelize],
      path: migrationsPath
    },
    logging(message) {
      if (message.startsWith('==')) return;
      if (message.startsWith('File:')) {
        const file = message.split(/\s+/g)[1];
        return logger.info({ file }, message);
      }
      return logger.info(message);
    }
  });

  umzug.on('migrating', m => logger.info({ migration: m }, '⬆️  Migrating:', m));
  umzug.on('migrated', m => logger.info({ migration: m }, '⬆️  Migrated:', m));
  umzug.on('reverting', m => logger.info({ migration: m }, '⬇️  Reverting:', m));
  umzug.on('reverted', m => logger.info({ migration: m }, '⬇️  Reverted:', m));

  return sequelize.authenticate()
    .then(() => logger.info(getConfig(sequelize), '🗄️  Connected to database'))
    .then(() => checkPostgreVersion(sequelize))
    .then(() => !isProduction && umzug.up())
    .then(() => umzug.executed())
    .then(migrations => {
      const files = migrations.map(it => it.file);
      if (!files.length) return;
      logger.info({ migrations: files }, '🗄️  Executed migrations:\n', files.join('\n'));
    });
}

const models = {
  User: defineModel(User)
};

function defineModel(Model, connection = sequelize) {
  const { DataTypes } = connection.Sequelize;
  const fields = invoke(Model, 'fields', DataTypes, connection) || {};
  const options = invoke(Model, 'options') || {};
  Object.assign(options, { sequelize: connection });
  wrapAsyncMethods(Model);
  return Model.init(fields, options);
}

forEach(models, model => {
  invoke(model, 'associate', models);
  addHooks(model, Hooks, models);
  addScopes(model, models);
});

function addHooks(model, Hooks, models) {
  const hooks = invoke(model, 'hooks', Hooks, models);
  forEach(hooks, (it, type) => model.addHook(type, it));
}

function addScopes(model, models) {
  const scopes = invoke(model, 'scopes', models);
  forEach(scopes, (scope, name) => {
    if (name === 'defaultScope') scope = result(scopes, 'defaultScope');
    model.addScope(name, scope, { override: true });
  });
}

const db = {
  Sequelize,
  sequelize,
  initialize,
  ...models
};

// Patch Sequelize#method to support getting models by class name.
sequelize.model = name => sequelize.models[name] || db[name];

module.exports = db;

function createConnection(config) {
  if (!config.url) return new Sequelize(config);
  return new Sequelize(config.url, config);
}

function getConfig(sequelize) {
  // NOTE: List public fields:
  // https://github.com/sequelize/sequelize/blob/v5.12.2/lib/sequelize.js#L280-L295
  return pick(sequelize.config, [
    'database', 'username', 'host', 'port', 'protocol',
    'pool',
    'native',
    'ssl',
    'replication',
    'dialectModulePath',
    'keepDefaultTimezone',
    'dialectOptions'
  ]);
}

function checkPostgreVersion(sequelize) {
  return sequelize.getQueryInterface().databaseVersion().then(version => {
    logger.info({ version }, 'PostgreSQL version:', version);
    const range = pkg.engines && pkg.engines.postgres;
    if (!range) return;
    if (semver.satisfies(semver.coerce(version), range)) return;
    const err = new Error(`"${pkg.name}" requires PostgreSQL ${range}`);
    logger.error({ version, required: range }, err.message);
    return Promise.reject(err);
  });
}
