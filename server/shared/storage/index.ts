import * as providers from './providers';
import autobind from 'auto-bind';
import { Config } from '../../config';

class Storage {
  #provider;

  constructor(config: Config) {
    this.#provider = providers[config.storage.provider].create(config);
    autobind(this);
  }

  getFile(key: string, options = {}): Promise<void> {
    return this.#provider.getFile(key, options);
  }

  createReadStream(key: string, options = {}): Promise<void> {
    return this.#provider.createReadStream(key, options);
  }

  saveFile(key: string, data = {}, options = {}): Promise<void> {
    return this.#provider.saveFile(key, data, options);
  }

  createWriteStream(key: string, options = {}): Promise<void> {
    return this.#provider.createWriteStream(key, options);
  }

  deleteFile(key: string, options = {}): Promise<void> {
    return this.#provider.deleteFile(key, options);
  }

  deleteFiles(keys: string[], options = {}): Promise<void> {
    return this.#provider.deleteFiles(keys, options);
  }

  listFiles(options = {}): Promise<void> {
    return this.#provider.listFiles(options);
  }

  fileExists(key: string, options = {}): Promise<void> {
    return this.#provider.fileExists(key, options);
  }

  getFileUrl(key: string, options = {}): Promise<void> {
    return this.#provider.getFileUrl(key, options);
  }

  moveFile(key: string, newKey: string, options = {}): Promise<void> {
    return this.#provider.moveFile(key, newKey, options);
  }

  copyFile(key: string, newKey: string, options = {}): Promise<void> {
    return this.#provider.copyFile(key, newKey, options);
  }
}

export default Storage;
