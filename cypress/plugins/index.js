'use strict';

require('dotenv').config({ path: require.resolve('../.env') });
const joi = require('joi');

const ENV_SECRETS = [
  'API_URL'
];

const schema = joi.object({
  API_URL: joi.string().required()
}).unknown();
joi.assert(process.env, schema);

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = async (on, config) => {
  config.baseUrl = process.env.API_URL;
  ENV_SECRETS.forEach(secret => {
    config.env[secret] = process.env[secret];
  });
  return config;
};
