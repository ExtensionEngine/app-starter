import 'reflect-metadata';
import * as authMiddleware from './auth/middleware';
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
import Storage from './shared/storage';
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
  provider.service('storage', Storage, 'config');
  provider.service(
    'userNotificationService',
    UserNotificationService,
    'config', 'mail', 'authService'
  );
  provider.service('userImportService', UserImportService, 'config', 'userRepository');
  provider.registerMiddleware(
    'authInitializeMiddleware',
    authMiddleware.initialize,
    'config', 'userRepository', 'authService'
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
    authInitializeMiddleware,
    parsePaginationMiddleware
  } = container;
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    RequestContext.create(db.provider.em, next);
  });
  app.use(authInitializeMiddleware, parsePaginationMiddleware);
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
}
