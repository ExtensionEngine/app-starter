import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { Application, NextFunction, Request, Response } from 'express';
import createConfig from './config';
import Db from './shared/database';
import ErrorHandler from './shared/error-handler';
import { IContainer } from 'bottlejs';
import IProgram from './types/program';
import logger from './shared/logger';
import Mail from './shared/mail';
import { parsePagination } from './middleware/pagination';
import { Provider } from './framework/provider';
import { RequestContext } from '@mikro-orm/core';
import user from './user';

dotenv.config();

const program: IProgram = {
  configure,
  beforeStart,
  registerRouters
};
export default program;

function configure(provider: Provider): void {
  provider.factory('config', () => createConfig(process.env));
  provider.value('logger', logger);
  provider.registerMiddleware('errorHandler', ErrorHandler);
  provider.registerService('db', Db);
  provider.registerService('mail', Mail);
  provider.registerModule('user', user);
}

async function beforeStart({ db }: IContainer): Promise<void> {
  await db.connect();
}

function registerRouters(app: Application, container: IContainer): void {
  const { db, userRouter } = container;
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    RequestContext.create(db.provider.em, next);
  });
  app.use('/api', parsePagination);
  app.use('/api/users', userRouter);
}
