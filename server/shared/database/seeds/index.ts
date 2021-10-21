import { EntityManager } from '@mikro-orm/postgresql';
import seedUsers from './users';

export default async (em: EntityManager): Promise<void> => {
  await seedUsers(em);
};
