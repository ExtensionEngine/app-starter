import configure from './configure';
import createApp from './app';
import createServer from './server';
import { IContainer } from 'bottlejs';
import main from '../main';
import provider from './provider';

process.on('unhandledRejection', error => {
  throw error;
});

process.on('uncaughtException', error => {
  const { logger } = provider.container;
  if (logger) logger.error(error);
  process.exit(1);
});

start();

async function start() {
  configure(provider, main);
  provider.factory('app', container => createApp(container, main.registerRouters));
  provider.factory('server', createServer);
  await main.beforeStart(provider.container);
  const { server, config } = provider.container;
  server.listen(config.server.port);
}
