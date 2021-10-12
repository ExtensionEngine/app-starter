import {
  Connection,
  EventSubscriber,
  IDatabaseDriver,
  LoadStrategy,
  MikroORM
} from '@mikro-orm/core';
import autobind from 'auto-bind';
import { Config } from '../../config';
import entities from './entities';
import Logger from 'bunyan';
import p from 'bluebird';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';

export type DatabaseProvider = MikroORM<PostgreSqlDriver>;

const isProduction = process.env.NODE_ENV === 'production';

class Db {
  #config: Config;
  #subscribers: EventSubscriber[]
  #logger: Logger;
  #provider?: DatabaseProvider;

  constructor(config: Config, logger: Logger, userSubscriber: EventSubscriber) {
    this.#logger = logger;
    this.#config = config;
    this.#subscribers = [userSubscriber];
    autobind(this);
  }

  get provider(): MikroORM<PostgreSqlDriver> {
    if (!this.#provider) throw new Error('Database not connected');
    return this.#provider;
  }

  async connect(): Promise<MikroORM<IDatabaseDriver<Connection>>> {
    const { database } = this.#config;
    this.#provider = await MikroORM.init({
      ...database,
      loadStrategy: LoadStrategy.JOINED,
      subscribers: this.#subscribers,
      entities
    });
    if (!isProduction) await this.migrate();
    return this.provider;
  }

  async reset(): Promise<void> {
    const { em } = this.provider;
    const entities = this.#provider.config.get('entities');
    await p.each(entities, entity => {
      return em
        .createQueryBuilder(entity as string)
        .truncate()
        .execute();
    });
  }

  migrate(): Promise<void> {
    const migrator = this.#provider.getMigrator();
    return migrator.up()
      .then(() => this.#logger.info('Migrations up!'))
      .catch(async () => {
        this.#logger.error('Migrating failed!');
        await migrator.down();
        this.#logger.info('Migrations down!');
      });
  }
}

export default Db;
