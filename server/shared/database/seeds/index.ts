import { EntityManager } from '@mikro-orm/postgresql';
import seedAdmin from './admin';
import seedUsers from './users';

export default async (em: EntityManager): Promise<void> => {
  await seedAdmin(em);
  await seedUsers(em);
};
