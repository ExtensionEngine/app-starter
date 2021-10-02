---
to: "<%= `${h.getResourcePath(resource, path)}/interfaces/repository.ts` %>"
---
import {
  EntityData,
  FilterQuery,
  FindOneOptions,
  FindOptions
} from '@mikro-orm/core';
import <%= Resource = h.capitalize(resource) %> from '../model';

interface I<%= Resource %>Repository {
  findOne(
    where: FilterQuery<<%= Resource %>>,
    options?: FindOneOptions<<%= Resource %>>
  ): Promise<<%= Resource %> | null>;
  findAll(options?: FindOptions<<%= Resource %>>): Promise<<%= Resource %>[]>;
  persistAndFlush(entity: <%= Resource %> | <%= Resource %>[]): Promise<void>;
  flush(): Promise<void>;
  assign(
    entity: <%= Resource %>,
    data: EntityData<<%= Resource %>>
  ): <%= Resource %>;
}

export default I<%= Resource %>Repository;
