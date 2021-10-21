import * as providers from './providers';
import { Config } from '../../config';
import IStorage from './interface';

export default function createStorage(config: Config): IStorage {
  return new providers[config.storage.provider](config);
}
