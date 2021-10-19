import App, { Router } from 'express';
import AuthController from './controller';
import Authenticate from './middleware/authenticate';
import { requestLimiter } from '../middleware/request';

export default function createRouter(
  authController: AuthController,
  authenticate: Authenticate
): Router {
  return App.Router()
    .post('/login', authenticate.handle('local', { setCookie: true }), authController.me)
    .post('/forgot-password', authController.forgotPassword)
    .post(
      '/reset-password',
      requestLimiter(),
      authenticate.handle('token'),
      authController.resetPassword
    )
    .use(authenticate.handle('jwt'))
    .get('/me', authController.me)
    .get('/logout', authenticate.logout());
}
