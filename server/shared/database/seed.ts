import Db from '.';
import Logger from 'bunyan';
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
    const seed = await this.load(resourceName);
    await seed(this.#db.provider.em);
    this.#log.info('Database successfully seeded');
  }

  async load(name: string): Promise<any> {
    const fullPath = path.join(process.cwd(), 'server/shared/database/seeds', name);
    const mod = await import(fullPath);
    return mod.default;
  }
}

export default Seed;
