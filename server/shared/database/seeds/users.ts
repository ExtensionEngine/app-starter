import { EntityManager } from '@mikro-orm/postgresql';
import roles from '../../../user/roles';
import times from 'lodash/times';
import User from '../../../user/model';

async function seedUsers(em: EntityManager): Promise<void> {
  const admin = new User(
    'Admin',
    'Example',
    'admin@example.org',
    roles.ADMIN,
    'admin123'
  );
  const users = times(10, idx => {
    const suffix = idx || '';
    return new User(
      `User ${suffix}`,
      'Example',
      `user${suffix}@example.org`,
      roles.USER,
      'user123'
    );
  });
  await em.persistAndFlush([admin, ...users]);
}

export default seedUsers;
