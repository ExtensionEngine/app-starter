import App, { Router } from 'express';
import AuthController from './controller';
import { authenticate } from './middleware';
import { requestLimiter } from '../middleware/request';

export default function createRouter(authController: AuthController): Router {
  return App.Router()
    .post('/login', authenticate('local'), authController.me)
    .post('/forgot-password', authController.forgotPassword)
    .post(
      '/reset-password',
      requestLimiter(),
      authenticate('token'),
      authController.resetPassword
    );
}
