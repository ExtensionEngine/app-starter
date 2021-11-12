'use strict';

const { ip, port } = require('./config');
const app = require('./app');
const bluebird = require('bluebird');
const database = require('./common/database');
const { promisify } = require('util');
const logger = require('./common/logger')();

if (process.env.NODE_ENV !== 'production') {
  bluebird.config({ longStackTraces: true });
}
const runServer = promisify(app.listen.bind(app));

const address = `http://${ip}:${port}`;

database.initialize()
  .then(() => runServer(port, ip))
  .then(() => logger.info({ port, ip }, '✈️  Server listening on', address))
  .catch(err => {
    logger.fatal(err, '🚨  Starting server failed');
    process.exit(1);
  });
