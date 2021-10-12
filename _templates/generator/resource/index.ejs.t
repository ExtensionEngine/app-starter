---
to: "<%= `${h.getResourcePath(resource, path)}/index.ts` %>"
---
import Controller from './controller';
import { Provider } from '../framework/provider';
import Repository from './repository';
import createRouter from './router';

export default { load };

function load(provider: Provider): void {
  provider.service('<%= resource %>Router', createRouter, '<%= resource %>Controller');
  provider.service('<%= resource %>Repository', Repository, 'db');
  provider.service('<%= resource %>Controller', Controller, '<%= resource %>Repository');
};
