import 'reflect-metadata';
import * as providers from './shared/storage';
import { Application, NextFunction, Request, Response } from 'express';
import auth from './auth';
import Db from './shared/database';
import ErrorHandler from './shared/error-handler';
import { IContainer } from 'bottlejs';
import IProgram from './types/program';
import logger from './shared/logger';
import Mail from './shared/mail';
import parsePaginationMiddleware from './middleware/pagination';
import { Provider } from './framework/provider';
import { RequestContext } from '@mikro-orm/core';
import user from './user';
import UserImportService from './user/import.service';
import UserNotificationService from './user/notification.service';
import UserSubscriber from './user/subscriber';

const program: IProgram = {
  configure,
  beforeStart,
  registerRouters
};

export default program;

function configure(provider: Provider): void {
  provider.value('logger', logger);
  provider.registerMiddleware('errorHandler', ErrorHandler, 'logger');
  provider.service('db', Db, 'config', 'logger', 'userSubscriber');
  provider.service('mail', Mail, 'config', 'logger');

  const Storage = providers[provider.container.config.storage.provider];
  provider.service('storage', Storage, 'config');

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
  provider.registerMiddleware('parsePaginationMiddleware', parsePaginationMiddleware);
  provider.service('userSubscriber', UserSubscriber, 'config');
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
    setAuthRequestContextMiddleware,
    parsePaginationMiddleware
  } = container;
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    RequestContext.create(db.provider.em, next);
  });
  app.use(setAuthRequestContextMiddleware, parsePaginationMiddleware);
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
}
