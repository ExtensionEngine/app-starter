import Env from '../types/env';
import joi from 'joi';

export interface ServerConfig {
  port: number;
  serverUrl: string;
  importTemplateFormat: string;
}

const schema = joi.object({
  port: joi.number().port().default(3000),
  serverUrl: joi.string().required(),
  importTemplateFormat: joi.string().default('xlsx')
});

const createConfig = (env: Env): ServerConfig => ({
  port: Number(env.SERVER_PORT),
  serverUrl: env.SERVER_URL,
  importTemplateFormat: env.IMPORT_TEMPLATE_FORMAT
});

export default (env: Env): ServerConfig => joi.attempt(createConfig(env), schema);
