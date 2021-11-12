---
to: "<%= `${h.getResourcePath(resource, path)}/index.ts` %>"
---
import * as middlewares from './middleware';
import camelCase from 'lodash/camelCase';
import Controller from './controller';
import forEach from 'lodash/forEach';
import { Provider } from '../framework/provider';
import Repository from './repository';
import createRouter from './router';

export default { load };

function load(provider: Provider): void {
  provider.service('<%= resource = h.changeCase.camelCase(resource) %>Router', createRouter, '<%= resource %>Controller');
  provider.service('<%= resource %>Repository', Repository, 'db');
  provider.service('<%= resource %>Controller', Controller, '<%= resource %>Repository');
  forEach(middlewares, (Middleware, name) => {
    provider.registerMiddleware(camelCase(name), Middleware, '<%= resource %>Repository');
  });
};
