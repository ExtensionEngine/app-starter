import autobind from 'auto-bind';
import Db from '../';
import Logger from 'bunyan';
import map from 'lodash/map';
import users from './users';

const SEED_MODULES = [users];

class Seed {
  #db: Db;
  #log: Logger;

  constructor(db: Db, logger: Logger) {
    this.#db = db;
    this.#log = logger.child({ service: 'seed' });
    autobind(this);
  }

  async run(): Promise<void> {
    await this.#db.connect();
    this.#log.info('Seeding database...');
    const pSeeds = map(SEED_MODULES, seed => seed(this.#db.provider.em));
    await Promise.all(pSeeds);
    this.#log.info('Database successfully seeded');
  }
}

export default Seed;
