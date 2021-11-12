---
to: "<%= `${h.getResourcePath(resource, path)}/model.ts` %>"
---
import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property
} from '@mikro-orm/core';
import BaseEntity from '<%= h.getBaseEntityPath(
  h.getResourcePath(resource, path),
  'server/shared/database/base-entity'
) %>';

@Entity()
class <%= Resource = h.changeCase.pascalCase(resource) %> extends BaseEntity {
  @Property()
  textProp: string;

  @Property({ nullable: true })
  optionalProp?: string;

  @ManyToOne(() => Entity)
  entity!: Entity;

  @OneToMany(() => Entity, entity => entity.reference)
  entities = new Collection<Entity>(this);

  constructor() {
    super();
  }
}

export default <%= Resource %>;
