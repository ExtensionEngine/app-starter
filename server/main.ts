import 'reflect-metadata';
import { Application, NextFunction, Request, Response } from 'express';
import auth from './auth';
import Db from './shared/database';
import ErrorHandler from './shared/error-handler';
import { IContainer } from 'bottlejs';
import IProgram from './types/program';
import logger from './shared/logger';
import Mail from './shared/mail';
import parseQueryMiddleware from './shared/query-parser/middleware';
import { Provider } from './framework/provider';
import { RequestContext } from '@mikro-orm/core';
import Seed from './shared/database/seeds';
import Storage from './shared/storage';
import user from './user';
import UserImportService from './user/import.service';
import UserNotificationService from './user/notification.service';

const program: IProgram = {
  configure,
  beforeStart,
  registerRouters
};

export default program;

function configure(provider: Provider): void {
  provider.value('logger', logger);
  provider.registerMiddleware('errorHandler', ErrorHandler, 'logger');
  provider.service('db', Db, 'config', 'logger');
  provider.service('mail', Mail, 'config', 'logger');
  provider.service('storage', Storage, 'config');
  provider.service('seed', Seed, 'db', 'logger');
  provider.service(
    'userNotificationService',
    UserNotificationService,
    'config', 'mail', 'authService'
  );
  provider.service(
    'userImportService',
    UserImportService,
    'config', 'userRepository', 'userNotificationService'
  );
  provider.registerModule(auth);
  provider.registerModule(user);
}

async function beforeStart({ db }: IContainer): Promise<void> {
  await db.connect();
}

function registerRouters(app: Application, container: IContainer): void {
  const {
    db,
    userRouter,
    authRouter,
    setAuthRequestContextMiddleware
  } = container;
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    RequestContext.create(db.provider.em, next);
  });
  app.use(setAuthRequestContextMiddleware, parseQueryMiddleware);
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
}
