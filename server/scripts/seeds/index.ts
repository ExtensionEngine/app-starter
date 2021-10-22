import { Command } from 'commander';
import provider from '../../framework/provider';
import { RequestContext } from '@mikro-orm/core';

const program = new Command('seed');

program.action(async () => {
  const { db, seed } = provider.container;
  await db.connect();
  return RequestContext.createAsync(db.provider.em, seed.run);
});

export default program;
