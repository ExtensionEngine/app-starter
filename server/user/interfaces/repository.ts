import {
  EntityData,
  FilterQuery,
  FindOneOptions,
  FindOptions
} from '@mikro-orm/core';
import User from '../model';

interface IUserRepository {
  findOne(
    where: FilterQuery<User>,
    options?: FindOneOptions<User>
  ): Promise<User | null>;
  find(where: FilterQuery<User>, options?: FindOptions<User>): Promise<User[]>;
  findAll(options?: FindOptions<User>): Promise<User[]>;
  persistAndFlush(user: User | User[]): Promise<void>;
  removeAndFlush(user: User): Promise<void>;
  flush(): Promise<void>;
  assign(user: User, data: EntityData<User>): User;
}

export default IUserRepository;
