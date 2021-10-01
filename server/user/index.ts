import App, { Router } from 'express';
import { authenticate } from '../auth/middleware';
import Controller from './controller';
import { IContainer } from 'bottlejs';
import Repository from './repository';

export default {
  createRouter,
  Repository,
  Controller
};

function createRouter({ userController }: IContainer): Router {
  return App.Router()
    .use(authenticate('jwt'))
    .get('/', userController.list)
    .post('/', userController.create)
    .get('/:userId', userController.get)
    .patch('/:userId', userController.patch)
    .delete('/:userId', userController.remove)
    .post('/:userId/invite', userController.invite);
}
