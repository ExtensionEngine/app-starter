import Db from '.';
import Logger from 'bunyan';
import map from 'lodash/map';
import path from 'path';

class Seed {
  #db: Db;
  #log: Logger;

  constructor(db: Db, logger: Logger) {
    this.#db = db;
    this.#log = logger.child({ service: 'seed' });
  }

  async run(resourceName: string): Promise<void> {
    await this.#db.connect();
    this.#log.info(`Seeding database with "${resourceName}" state`);
    const seeds = await this.load(resourceName);
    const pSeeds = map(seeds, seed => seed(this.#db.provider.em));
    await Promise.all(pSeeds);
    this.#log.info('Database successfully seeded');
  }

  async load(name: string): Promise<any[]> {
    const fullPath = path.join(process.cwd(), 'server/shared/database/seeds', name);
    const modules = await import(fullPath);
    return Object.values(modules);
  }
}

export default Seed;
