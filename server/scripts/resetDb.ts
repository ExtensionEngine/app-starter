import { Command } from 'commander';
import entities from '../shared/database/entities';
import p from 'bluebird';
import provider from '../framework/provider';
import { RequestContext } from '@mikro-orm/core';

const program = new Command('reset-db');
program.action(async () => {
  const { db } = provider.container;
  await db.connect();
  return RequestContext.createAsync(db.provider.em, reset);
});

async function reset(): Promise<void> {
  const { db, logger } = provider.container;
  const em = db.provider.em.fork(false);
  await em.begin();
  return p.each(entities, it => em.nativeDelete(it))
    .then(() => {
      logger.info('Database has been reset successfuly.');
      return em.commit();
    })
    .catch(err => {
      logger.error(err);
      return em.rollback();
    });
}

export default program;
