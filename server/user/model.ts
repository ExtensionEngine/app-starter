import {
  Entity,
  Enum,
  Property,
  Unique
} from '@mikro-orm/core';
import BaseEntity from '../shared/database/base-entity';
import bcrypt from 'bcrypt';
import { Role } from './roles';

@Entity()
class User extends BaseEntity {
  @Property()
  firstName: string;

  @Property()
  lastName: string;

  @Property()
  @Unique()
  email: string

  @Enum()
  role: Role;

  @Property({ nullable: true })
  deletedAt: Date;

  @Property({ nullable: true, hidden: true })
  private passwordHash?: string;

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
    if (password) this.password = password;
  }

  @Property({ persist: false })
  get password(): string {
    return this.passwordHash;
  }

  set password(value: string) {
    this.passwordHash = bcrypt.hashSync(value, 10);
  }

  @Property({ persist: false })
  get fullName(): string | null {
    return [this.firstName, this.lastName].filter(Boolean).join(' ') || null;
  }

  @Property({ persist: false })
  get label(): string {
    return this.fullName || this.email;
  }
}

export default User;
