import * as providers from './providers';
import IStorage, {
  ContentResponse,
  DeleteResponse,
  ExistsResponse,
  Response
} from './interface';
import autobind from 'auto-bind';
import { Config } from '../../config';

class Storage implements IStorage {
  #provider: IStorage;

  constructor(config: Config) {
    this.#provider = providers[config.storage.provider].create(config);
    autobind(this);
  }

  getFile(key: string): Promise<ContentResponse<string>> {
    return this.#provider.getFile(key);
  }

  createReadStream(key: string): NodeJS.ReadableStream {
    return this.#provider.createReadStream(key);
  }

  saveFile(key: string, data: string): Promise<Response> {
    return this.#provider.saveFile(key, data);
  }

  createWriteStream(key: string): Promise<Response> | Response {
    return this.#provider.createWriteStream(key);
  }

  copyFile(key: string, newKey: string, mode?: number): Promise<Response> {
    return this.#provider.copyFile(key, newKey, mode);
  }

  moveFile(key: string, newKey: string, mode?: number): Promise<Response> {
    return this.#provider.moveFile(key, newKey, mode);
  }

  deleteFile(key: string): Promise<DeleteResponse> {
    return this.#provider.deleteFile(key);
  }

  deleteFiles(keys: string[]): Promise<DeleteResponse> {
    return this.#provider.deleteFiles(keys);
  }

  listFiles(key: string): Promise<string[]> {
    return this.#provider.listFiles(key);
  }

  fileExists(key: string): Promise<ExistsResponse> {
    return this.#provider.fileExists(key);
  }

  getFileUrl(key: string): Promise<string> {
    return this.#provider.getFileUrl(key);
  }
}

export default Storage;
