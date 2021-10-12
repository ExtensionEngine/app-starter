---
to: "<%= `${h.getResourcePath(resource, path)}/router.ts` %>"
---
import App, { Router } from 'express';
import <%= Resource %>Controller from './controller';

export default createRouter;

function createRouter(<%= resource %>Controller: <%= Resource %>Controller): Router {
  return App.Router()
    .get('/', <%= resource %>Controller.getAll)
    .get('/:<%= resource %>Id', <%= resource %>Controller.get)
    .post('/', <%= resource %>Controller.post)
    .patch('/:<%= resource %>Id', <%= resource %>Controller.patch);
}
