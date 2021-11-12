import Db, { DatabaseProvider } from '../shared/database';
import { EntityData, FilterQuery, FindOneOptions, FindOptions } from '@mikro-orm/core';
import IUserRepository from './interfaces/repository';
import User from './model';

class UserRepository implements IUserRepository {
  #dbProvider: DatabaseProvider;

  constructor(db: Db) {
    this.#dbProvider = db.provider;
  }

  findOne(
    where: FilterQuery<User>,
    options?: FindOneOptions<User>
  ): Promise<User | null> {
    return this.instance.findOne(where, options);
  }

  findAndCount(
    where: FilterQuery<User>,
    options?: FindOptions<User>
  ): Promise<[User[], number]> {
    return this.instance.findAndCount(where, options);
  }

  findAll(options?: FindOptions<User>): Promise<User[]> {
    return this.instance.findAll(options);
  }

  persistAndFlush(user: User | User[]): Promise<void> {
    return this.instance.persistAndFlush(user);
  }

  removeAndFlush(user: User): Promise<void> {
    return this.instance.removeAndFlush(user);
  }

  flush(): Promise<void> {
    return this.instance.flush();
  }

  assign(user: User, data: EntityData<User>): User {
    return this.instance.assign(user, data);
  }

  private get instance() {
    return this.#dbProvider.em.getRepository(User);
  }
}

export default UserRepository;
