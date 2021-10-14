import * as providers from './providers';
import { Config } from '../../config';
import IStorage from './interface';

function createStorage(config: Config): IStorage {
  return providers[config.storage.provider].create(config);
}

export default createStorage;
