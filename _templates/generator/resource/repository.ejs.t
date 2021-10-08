---
to: "<%= `${h.getResourcePath(resource, path)}/repository.ts` %>"
---
import {
  EntityData,
  FilterQuery,
  FindOneOptions,
  FindOptions
} from '@mikro-orm/core';
import Db, { DatabaseProvider } from '../shared/database';
import <%= Resource = h.capitalize(resource) %> from './model';
import I<%= Resource %>Repository from './interfaces/repository';

class <%= Resource %>Repository implements I<%= Resource %>Repository {
  #dbProvider: DatabaseProvider;

  constructor(db: Db) {
    this.#dbProvider = db.provider;
  }

  findOne(
    where: FilterQuery<<%= Resource %>>,
    options?: FindOneOptions<<%= Resource %>>
  ): Promise<<%= Resource %> | null> {
    const repository = this.#dbProvider.em.getRepository(<%= Resource %>);
    return repository.findOne(where, options);
  }

  findAll(options?: FindOptions<<%= Resource %>>): Promise<<%= Resource %>[]> {
    const repository = this.#dbProvider.em.getRepository(<%= Resource %>);
    return repository.findAll(options);
  }

  persistAndFlush(entity: <%= Resource %> | <%= Resource %>[]): Promise<void> {
    const repository = this.#dbProvider.em.getRepository(<%= Resource %>);
    return repository.persistAndFlush(entity);
  }

  flush(): Promise<void> {
    const repository = this.#dbProvider.em.getRepository(<%= Resource %>);
    return repository.flush();
  }

  assign(
    entity: <%= Resource %>,
    data: EntityData<<%= Resource %>>
  ): <%= Resource %> {
    const repository = this.#dbProvider.em.getRepository(<%= Resource %>);
    return repository.assign(entity, data);
  }
}

export default <%= Resource %>Repository;
