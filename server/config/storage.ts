import Env from '../types/env';
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
  provider: joi.string().valid('filesystem', 'amazon').required(),
  amazon: joi.object()
    .when('provider', {
      is: joi.valid('amazon'),
      then: joi.object({
        key: joi.string().required(),
        secret: joi.string().required(),
        region: joi.string().required(),
        bucket: joi.string().required()
      })
    }),
  filesystem: joi.object()
    .when('provider', {
      is: joi.valid('filesystem'),
      then: joi.object({
        path: joi.string().required()
      })
    })
});

const createConfig = (env: Env): StorageConfig => ({
  amazon: {
    key: env.STORAGE_KEY,
    secret: env.STORAGE_SECRET,
    region: env.STORAGE_REGION,
    bucket: env.STORAGE_BUCKET
  },
  filesystem: { path: env.STORAGE_PATH },
  provider: env.STORAGE_PROVIDER
});

export default (env: Env): StorageConfig => joi.attempt(createConfig(env), schema);
