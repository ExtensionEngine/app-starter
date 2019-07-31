'use strict';

const { createLogger, Level } = require('../../common/logger');
const logger = createLogger('db', { level: Level.DEBUG });

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  ...readConfig(),
  operatorsAliases: false,
  migrationStorageTableName: 'sequelize_meta',
  benchmark: !isProduction,
  logging(query, time) {
    const info = { query };
    if (time) info.duration = `${time}ms`;
    return logger.debug(info);
  }
};

function readConfig(config = process.env) {
  if (config.DATABASE_URI) return { url: config.DATABASE_URI };
  if (!config.DATABASE_NAME) {
    throw new TypeError(`Invalid \`DATABASE_NAME\` provided: ${config.DATABASE_NAME}`);
  }
  return {
    database: config.DATABASE_NAME,
    username: config.DATABASE_USER,
    password: config.DATABASE_PASSWORD,
    host: config.DATABASE_HOST,
    port: config.DATABASE_PORT,
    dialect: config.DATABASE_ADAPTER || 'postgres'
  };
}
