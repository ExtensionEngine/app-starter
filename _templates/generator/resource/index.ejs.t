---
to: "<%= `${h.getResourcePath(resource, path)}/index.ts` %>"
---
import App, { Router } from 'express';
import Controller from './controller';
import { IContainer } from 'bottlejs';
import Repository from './repository';

export default {
  createRouter,
  Controller,
  Repository
};

function createRouter({ <%= resource %>Controller }: IContainer): Router {
  return App.Router()
    .get('/', <%= resource %>Controller.getAll)
    .get('/:<%= resource %>Id', <%= resource %>Controller.get)
    .post('/', <%= resource %>Controller.post)
    .patch('/:<%= resource %>Id', <%= resource %>Controller.patch);
}
