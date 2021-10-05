'use strict';

import roles, { Role } from '../user/roles';
import times from 'lodash/times';
import { UserDTO } from '../user/interfaces/dtos';

export function generateUsers(): UserDTO[] {
  const users = [{
    firstName: 'Admin',
    lastName: 'Example',
    email: 'admin@example.org',
    role: roles.ADMIN as Role
  }];
  times(10, i => {
    const suffix = i || '';
    users.push({
      firstName: `User ${suffix}`,
      lastName: 'Example',
      email: `user${suffix}@example.org`,
      role: roles.USER
    });
  });
  return users;
}
