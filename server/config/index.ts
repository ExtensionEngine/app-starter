import auth, { AuthConfig } from './auth';
import database, { DatabaseConfig } from './database';
import environments, { Environment } from './environments';
import mail, { MailConfig } from './mail';
import server, { ServerConfig } from './server';
import storage, { StorageConfig } from './storage';
import IEnv from '../types/env';
import joi from 'joi';

export interface Config {
  environment: Environment;
  database: DatabaseConfig;
  server: ServerConfig;
  auth: AuthConfig;
  storage: StorageConfig;
  mail: MailConfig;
}

const schema = joi.object({
  environment: joi.string().valid(...environments).required(),
  database: joi.object(),
  server: joi.object(),
  auth: joi.object(),
  storage: joi.object(),
  mail: joi.object()
});

const createConfig = (env: IEnv) => ({
  environment: env.NODE_ENV,
  database: database(env),
  server: server(env),
  auth: auth(env),
  storage: storage(env),
  mail: mail(env)
});

export default (env: IEnv): Config => joi.attempt(createConfig(env), schema);
