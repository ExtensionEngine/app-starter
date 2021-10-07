import App, { Router } from 'express';
import { authenticate } from './middleware';
import Controller from './controller';
import { IContainer } from 'bottlejs';
import { requestLimiter } from '../middleware/request';
import Service from './service';

export default {
  Service,
  Controller,
  createRouter
};

function createRouter({ authController }: IContainer): Router {
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
