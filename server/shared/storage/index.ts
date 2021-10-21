import { Config } from '../../config';
import IStorage from './interface';
import path from 'path';

export default async function createStorage(config: Config): Promise<IStorage> {
  const fullPath = path.join(__dirname, 'providers', config.storage.provider);
  const Provider = (await import(fullPath)).default;
  return new Provider(config);
}
