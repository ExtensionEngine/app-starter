import { Command } from 'commander';
import provider from '../../framework/provider';
import { RequestContext } from '@mikro-orm/core';

const program = new Command('seed');
program
  .arguments('[resource]')
  .action(async resource => {
    const { db, seed } = provider.container;
    await db.connect();
    return RequestContext.createAsync(db.provider.em, () => seed.run(resource));
  });

export default program;
