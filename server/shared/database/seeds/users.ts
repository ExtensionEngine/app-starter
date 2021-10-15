import { EntityManager } from '@mikro-orm/postgresql';
import provider from '../../../framework/provider';
import roles from '../../../user/roles';
import times from 'lodash/times';
import User from '../../../user/model';

async function seedUsers(): Promise<void> {
  const em = provider.container.db.provider.em as EntityManager;
  const users = times(10, idx => {
    const suffix = idx || '';
    const role = idx ? roles.USER : roles.ADMIN;
    return new User(`User ${suffix}`, 'Example', `user${suffix}@example.org`, role);
  });
  await em.persistAndFlush(users);
}

export default seedUsers;
