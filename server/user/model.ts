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

  @Property({ persist: false })
  get fullName(): string | null {
    return [this.firstName, this.lastName].filter(Boolean).join(' ') || null;
  }

  @Property({ persist: false })
  get label(): string {
    return this.fullName || this.email;
  }

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
