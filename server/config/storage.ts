import IEnv from '../types/env';
import joi from 'joi';

export type Amazon = {
  key: string,
  secret: string,
  region: string,
  bucket: string
}

export type Filesystem = {
  path: string
}

export interface StorageConfig {
  amazon: Amazon;
  filesystem: Filesystem;
  provider: string;
}

const schema = {
  amazon: joi.object({
    key: joi.string().required(),
    secret: joi.string().required(),
    region: joi.string().required(),
    bucket: joi.string().required()
  }),
  filesystem: joi.object({ path: joi.string().required() }),
  provider: joi.string().valid('filesystem', 'amazon').required()
};

const createConfig = (env: IEnv): StorageConfig => ({
  amazon: {
    key: env.STORAGE_KEY,
    secret: env.STORAGE_SECRET,
    region: env.STORAGE_REGION,
    bucket: env.STORAGE_BUCKET
  },
  filesystem: { path: env.STORAGE_PATH },
  provider: env.STORAGE_PROVIDER
});

export default (env: IEnv): StorageConfig => {
  const config = createConfig(env);
  const { error, value: provider } = schema.provider.validate(config.provider);
  if (error) throw error;
  return joi.attempt(config[provider], schema[provider]);
};
