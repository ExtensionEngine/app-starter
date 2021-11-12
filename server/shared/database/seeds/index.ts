import autobind from 'auto-bind';
import Db from '../';
import Logger from 'bunyan';
import P from 'bluebird';
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
    await P.each(SEED_MODULES, seed => seed(this.#db.provider.em));
    this.#log.info('Database successfully seeded');
  }
}

export default Seed;
