import { EntityManager } from '@mikro-orm/postgresql';
import roles from '../../../user/roles';
import User from '../../../user/model';

async function seedAdmin(em: EntityManager): Promise<void> {
  const admin = new User('Admin', 'Example', 'admin@example.org', roles.ADMIN);
  await em.persistAndFlush(admin);
}

export default seedAdmin;
