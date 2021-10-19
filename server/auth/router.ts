import App, { Router } from 'express';
import AuthController from './controller';
import Authenticator from './middleware/authenticator';
import { requestLimiter } from '../middleware/request';

export default function createRouter(
  authController: AuthController,
  authenticator: Authenticator
): Router {
  return App.Router()
    .post(
      '/login',
      authenticator.authenticate('local', { setCookie: true }),
      authController.me
    )
    .post('/forgot-password', authController.forgotPassword)
    .post(
      '/reset-password',
      requestLimiter(),
      authenticator.authenticate('token'),
      authController.resetPassword
    )
    .use(authenticator.authenticate('jwt'))
    .get('/me', authController.me)
    .get('/logout', authenticator.logout());
}
