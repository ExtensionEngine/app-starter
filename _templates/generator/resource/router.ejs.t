---
to: "<%= `${h.getResourcePath(resource, path)}/router.ts` %>"
---
import App, { Router } from 'express';
import <%= Resource = h.changeCase.pascalCase(resource) %>Controller from './controller';

export default createRouter;

function createRouter(<%= resource = h.changeCase.camelCase(resource) %>Controller: <%= Resource %>Controller): Router {
  return App.Router()
    .get('/', <%= resource %>Controller.list)
    .get('/:<%= resource %>Id', <%= resource %>Controller.get)
    .post('/', <%= resource %>Controller.create)
    .patch('/:<%= resource %>Id', <%= resource %>Controller.update);
}
