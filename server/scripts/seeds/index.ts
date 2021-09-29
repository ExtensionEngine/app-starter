import { Command } from 'commander';
import provider from '../../framework/provider';
import { RequestContext } from '@mikro-orm/core';

const program = new Command('seed');
program
  .arguments('[state]')
  .action(async (state = 'initial') => {
    const { db, seed } = provider.container;
    await db.connect();
    await RequestContext.createAsync(db.provider.em, () => seed.run(state));
  });

export default program;
