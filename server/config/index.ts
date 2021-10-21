import auth, { AuthConfig } from './auth';
import database, { DatabaseConfig } from './database';
import environments, { Environment } from './environments';
import mail, { MailConfig } from './mail';
import server, { ServerConfig } from './server';
import storage, { StorageConfig } from './storage';
import Env from '../types/env';
import joi from 'joi';

export interface Config {
  appUrl: string,
  environment: Environment;
  database: DatabaseConfig;
  server: ServerConfig;
  auth: AuthConfig;
  storage: StorageConfig;
  mail: MailConfig;
}

const schema = joi.object({
  appUrl: joi.string().required().uri(),
  environment: joi.string().valid(...environments),
  database: joi.object(),
  server: joi.object(),
  auth: joi.object(),
  storage: joi.object(),
  mail: joi.object()
});

const createConfig = (env: Env) => ({
  appUrl: env.APP_URL,
  environment: env.NODE_ENV,
  database: database(env),
  server: server(env),
  auth: auth(env),
  storage: storage(env),
  mail: mail(env)
});

export default (env: Env): Config => joi.attempt(createConfig(env), schema);
