import * as middlewares from './middleware';
import camelCase from 'lodash/camelCase';
import Controller from './controller';
import createRouter from './router';
import forEach from 'lodash/forEach';
import { Provider } from '../framework/provider';
import Repository from './repository';

export default { load };

function load(provider: Provider): void {
  provider.service(
    'userRouter',
    createRouter,
    'userController', 'getUserMiddleware', 'authenticator'
  );
  provider.service('userRepository', Repository, 'db');
  provider.service(
    'userController',
    Controller,
    'userRepository', 'userNotificationService', 'userImportService'
  );
  forEach(middlewares, (Middleware, name) => {
    provider.registerMiddleware(camelCase(name), Middleware, 'userRepository');
  });
}
