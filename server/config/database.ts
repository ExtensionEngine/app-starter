import { Highlighter, MigrationsOptions } from '@mikro-orm/core';
import Env from '../types/env';
import joi from 'joi';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

export interface DatabaseConfig {
  host: string;
  port: number;
  dbName: string;
  user: string;
  password: string;
  type: 'postgresql';
  migrations: MigrationsOptions;
  debug: boolean;
  highlighter?: Highlighter;
}

const schema = joi.object({
  host: joi.string().required(),
  port: joi.number().default(5432),
  dbName: joi.string().required(),
  user: joi.string().required(),
  password: joi.string().required()
}).unknown();

const createConfig = (env: Env): DatabaseConfig => ({
  host: env.DATABASE_HOST,
  port: Number(env.DATABASE_PORT),
  dbName: env.DATABASE_NAME,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  type: 'postgresql',
  migrations: {
    path: `${process.cwd()}/server/shared/database/migrations`,
    disableForeignKeys: false
  },
  debug: env.NODE_ENV !== 'production',
  highlighter: env.NODE_ENV !== 'production' && new SqlHighlighter()
});

export default (env: Env): DatabaseConfig => {
  return joi.attempt(createConfig(env), schema);
};
