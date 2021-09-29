import database, { DatabaseConfig } from './database';
import environments, { Environment } from './environments';
import server, { ServerConfig } from './server';
import IProcessEnv from '../types/processEnv';
import joi from 'joi';
import auth, { AuthConfig } from './auth';
import storage, { StorageConfig } from './storage';
import mail, { MailConfig } from './mail';

export interface Config {
  environment: Environment,
  database: DatabaseConfig,
  server: ServerConfig,
  auth: AuthConfig,
  storage: StorageConfig,
  mail: MailConfig
}

const schema = joi.object({
  environment: joi.string().valid(...environments).required(),
  database: joi.object(),
  server: joi.object(),
  auth: joi.object(),
  storage: joi.object(),
  mail: joi.object()
});

const createConfig = (env: IProcessEnv) => ({
  environment: env.NODE_ENV,
  database: database(env),
  server: server(env),
  auth: auth(env),
  storage: storage(env),
  mail: mail(env)
});

export default (env: IProcessEnv): Config => joi.attempt(createConfig(env), schema);
