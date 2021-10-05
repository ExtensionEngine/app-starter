import {
  Entity,
  Enum,
  Property,
  Unique
} from '@mikro-orm/core';
import BaseEntity from '../shared/database/base-entity';
import { Role } from './roles';

@Entity()
class User extends BaseEntity {
  @Property()
  firstName: string;

  @Property()
  lastName: string;

  @Property({ nullable: true })
  password?: string

  @Property()
  @Unique()
  email: string

  @Enum()
  role: Role;

  @Property({ nullable: true })
  deletedAt: Date;

  @Property()
  fullName: string

  @Property()
  label: string

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    role: Role,
    password?: string
  ) {
    super();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.role = role;
    this.password = password;
  }
}

export default User;
