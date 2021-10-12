import { EntityData, FilterQuery, FindOneOptions, FindOptions } from '@mikro-orm/core';
import Db, { DatabaseProvider } from '../shared/database';
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
    const repository = this.#dbProvider.em.getRepository(User);
    return repository.findOne(where, options);
  }

  findAndCount(
    where: FilterQuery<User>,
    options?: FindOptions<User>
  ): Promise<[User[], number]> {
    const repository = this.#dbProvider.em.getRepository(User);
    return repository.findAndCount(where, options);
  }

  findAll(options?: FindOptions<User>): Promise<User[]> {
    const repository = this.#dbProvider.em.getRepository(User);
    return repository.findAll(options);
  }

  persistAndFlush(user: User | User[]): Promise<void> {
    const repository = this.#dbProvider.em.getRepository(User);
    return repository.persistAndFlush(user);
  }

  removeAndFlush(user: User): Promise<void> {
    const repository = this.#dbProvider.em.getRepository(User);
    return repository.removeAndFlush(user);
  }

  flush(): Promise<void> {
    const repository = this.#dbProvider.em.getRepository(User);
    return repository.flush();
  }

  assign(user: User, data: EntityData<User>): User {
    const repository = this.#dbProvider.em.getRepository(User);
    return repository.assign(user, data);
  }
}

export default UserRepository;
