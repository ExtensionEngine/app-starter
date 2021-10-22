'use strict';

require('dotenv').config();
const joi = require('joi');

const ENV_SECRETS = [
  'SERVER_URL',
  'APP_URL',
  'USER_EMAIL',
  'USER_PASSWORD',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD'
];

const schema = joi.object({
  SERVER_URL: joi.string().required(),
  APP_URL: joi.string().required(),
  USER_EMAIL: joi.string().required(),
  USER_PASSWORD: joi.string().required(),
  ADMIN_EMAIL: joi.string().required(),
  ADMIN_PASSWORD: joi.string().required()
}).unknown();
joi.assert(process.env, schema);

module.exports = async (on, config) => {
  config.baseUrl = process.env.APP_URL;
  ENV_SECRETS.forEach(secret => {
    config.env[secret] = process.env[secret];
  });
  return config;
};
