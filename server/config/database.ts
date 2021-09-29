import { Highlighter, MigrationsOptions } from '@mikro-orm/core';
import IProcessEnv from '../types/processEnv';
import joi from 'joi';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

export interface DatabaseConfig {
  dbName: string;
  user: string;
  password: string;
  type: 'postgresql';
  migrations: MigrationsOptions;
  debug: boolean;
  highlighter?: Highlighter
}

const schema = joi.object({
  dbName: joi.string().required(),
  user: joi.string().required(),
  password: joi.string().required()
}).unknown();

const createConfig = (env: IProcessEnv): DatabaseConfig => ({
  dbName: env.DATABASE_NAME,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  type: 'postgresql',
  migrations: {
    path: `${process.cwd()}/server/shared/database/migrations`,
    disableForeignKeys: false
  },
  debug: env.NODE_ENV === 'dev-local',
  highlighter: env.NODE_ENV === 'dev-local' && new SqlHighlighter()
});

export default (env: IProcessEnv): DatabaseConfig => {
  return joi.attempt(createConfig(env), schema);
};
