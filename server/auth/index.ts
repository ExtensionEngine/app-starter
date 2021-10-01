import App, { Router } from 'express';
import { authenticate } from './middleware';
import Controller from './controller';
import { IContainer } from 'bottlejs';
import Service from './service';

export default {
  Service,
  Controller,
  createRouter
};

function createRouter({ authController }: IContainer): Router {
  return App.Router()
    .post('/login', authenticate('local'), authController.me);
}
