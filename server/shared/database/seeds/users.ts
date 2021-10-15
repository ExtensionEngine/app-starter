import { EntityManager } from '@mikro-orm/postgresql';
import roles from '../../../user/roles';
import times from 'lodash/times';
import User from '../../../user/model';

async function seedUsers(em: EntityManager): Promise<void> {
  const users = times(10, idx => {
    const suffix = idx || '';
    const role = idx ? roles.USER : roles.ADMIN;
    return new User(`User ${suffix}`, 'Example', `user${suffix}@example.org`, role);
  });
  await em.persistAndFlush(users);
}

export default seedUsers;
