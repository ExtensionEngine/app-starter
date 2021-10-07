import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';
import autobind from 'auto-bind';
import bcrypt from 'bcrypt';
import { Config } from '../config';
import User from './model';

class UserSubscriber implements EventSubscriber<User> {
  #config: Config;

  constructor(config: Config) {
    this.#config = config;
    autobind(this);
  }

  getSubscribedEntities(): EntityName<User>[] {
    return [User];
  }

  private async encryptPassword({ password }: User): Promise<string> {
    return bcrypt.hash(password, this.#config.auth.saltRounds);
  }

  async beforeCreate({ entity, em }: EventArgs<User>): Promise<void> {
    if (!entity.password) return;
    const password = await this.encryptPassword(entity);
    const repository = em.getRepository(User);
    repository.assign(entity, { password });
  }

  async beforeUpdate({ entity, em, changeSet }: EventArgs<User>): Promise<void> {
    const isPasswordChanged = Boolean(changeSet.payload.password);
    if (!isPasswordChanged) return;
    const password = await this.encryptPassword(entity);
    const repository = em.getRepository(User);
    repository.assign(entity, { password });
  }
}

export default UserSubscriber;
