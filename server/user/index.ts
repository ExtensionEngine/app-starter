import * as middleware from './middleware';
import App, { Router } from 'express';
import { authenticate } from '../auth/middleware';
import Controller from './controller';
import { IContainer } from 'bottlejs';
import Repository from './repository';

export default {
  createRouter,
  Repository,
  Controller,
  middleware
};

function createRouter(provider: IContainer): Router {
  const { userController, getTargetUserMiddleware } = provider;
  return App.Router()
    .use(authenticate('jwt'))
    .get('/', userController.list)
    .post('/', userController.create)
    .param('userId', getTargetUserMiddleware)
    .get('/:userId', userController.get)
    .patch('/:userId', userController.patch)
    .delete('/:userId', userController.remove)
    .post('/:userId/invite', userController.invite);
}
