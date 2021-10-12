import Controller from './controller';
import createRouter from './router';
import { Provider } from '../framework/provider';
import Service from './service';
import SetRequestContext from './middleware/set-request-context';

export default { load };

function load(provider: Provider): void {
  provider.service('authRouter', createRouter, 'authController');
  provider.service('authService', Service, 'config', 'userRepository');
  provider.service(
    'authController',
    Controller,
    'authService', 'userRepository', 'userNotificationService'
  );
  provider.registerMiddleware(
    'setAuthRequestContextMiddleware',
    SetRequestContext,
    'authService'
  );
};
