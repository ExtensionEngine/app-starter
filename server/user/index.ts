import App, { Router } from 'express';
import Controller from './controller';
import { IContainer } from 'bottlejs';
import Repository from './repository';
import Service from './service';

export default {
  createRouter,
  Repository,
  Controller,
  Service
};

function createRouter({ userController }: IContainer): Router {
  return App.Router()
    .get('/', userController.list)
    .post('/', userController.create)
    .get('/:userId', userController.get)
    .patch('/:userId', userController.patch)
    .delete('/:userId', userController.remove)
    .post('/:id/invite', userController.invite);
}
