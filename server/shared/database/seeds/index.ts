import { EntityManager } from '@mikro-orm/postgresql';
import seedAdmin from './admin';
import seedUsers from './users';

export default async (em: EntityManager): Promise<void> => {
  await seedUsers(em);
  await seedAdmin(em);
};
