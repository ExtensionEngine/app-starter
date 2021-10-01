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

const schema = joi.object({
  amazon: joi.object(),
  filesystem: joi.object(),
  provider: joi.string().required()
});

function createConfig(env: IEnv): StorageConfig {
  const amazon: Amazon = {
    key: env.STORAGE_KEY,
    secret: env.STORAGE_SECRET,
    region: env.STORAGE_REGION,
    bucket: env.STORAGE_BUCKET
  };
  const filesystem: Filesystem = { path: env.STORAGE_PATH };
  return {
    amazon,
    filesystem,
    provider: env.STORAGE_PROVIDER
  };
}

export default (env: IEnv): StorageConfig => joi.attempt(createConfig(env), schema);
