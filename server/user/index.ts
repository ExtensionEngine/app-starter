import Controller from './controller';
import * as middlewares from './middleware';
import { Provider } from '../framework/provider';
import Repository from './repository';
import createRouter from './router';
import forEach from 'lodash/forEach';
import camelCase from 'lodash/camelCase';

export default { load };

function load(provider: Provider): void {
  provider.service('userRouter', createRouter, 'userController', 'getUserMiddleware');
  provider.service('userRepository', Repository, 'db');
  provider.service(
    'userController',
    Controller,
    'userRepository', 'userNotificationService', 'userImportService'
  );
  forEach(middlewares, (Middleware, name) => {
    provider.registerMiddleware(camelCase(name), Middleware, 'userRepository');
  });
};
