import IStorage, {
  ContentResponse,
  DeleteResponse,
  ExistsResponse,
  Response
} from '../interface';
import { Config } from '../../../config';
import exists from 'path-exists';
import expandPath from 'untildify';
import fs from 'fs';
import Joi from 'joi';
import mkdirp from 'mkdirp';
import P from 'bluebird';
import path from 'path';
import { validateConfig } from '../validation';

const fsAsync = P.promisifyAll(fs);

const isNotFound = (err: any): boolean => err.code === 'ENOENT';
const resolvePath = (str: string): string => path.resolve(expandPath(str));

const schema = Joi.object().keys({
  path: Joi.string().required()
});

class FilesystemStorage implements IStorage {
  #rootPath: string;
  #origin: string;

  constructor({ server, storage }: Config) {
    const config = validateConfig(storage.filesystem, schema);
    this.#origin = server.origin;
    this.#rootPath = resolvePath(config.path);
  }

  static create(config) {
    return new FilesystemStorage(config);
  }

  private path(...segments): string {
    segments = [this.#rootPath, ...segments];
    return path.join(...segments);
  }

  getFile(key: string): Promise<ContentResponse<string>> {
    return fsAsync.readFileAsync(this.path(key))
      .then(data => ({ content: data.toString(), raw: data }))
      .catch(err => isNotFound(err) ? null : Promise.reject(err));
  }

  createReadStream(key: string): NodeJS.ReadableStream {
    return fsAsync.createReadStream(this.path(key));
  }

  async saveFile(key: string, data: string | Buffer): Promise<Response> {
    const filePath = this.path(key);
    await mkdirp(path.dirname(filePath));
    const result = await fsAsync.writeFileAsync(filePath, data);
    return { raw: result };
  }

  async createWriteStream(key: string): Promise<Response> {
    const filepath = this.path(key);
    const dirname = path.dirname(filepath);
    await fsAsync.mkdirAsync(dirname);
    const result = await fsAsync.createWriteStream(filepath);
    return { raw: result };
  }

  async copyFile(key: string, newKey: string, mode: number): Promise<Response> {
    const src = this.path(key);
    const dest = this.path(newKey);
    await mkdirp(path.dirname(dest));
    const result = await fsAsync.copyFileAsync(src, dest, mode);
    return { raw: result };
  }

  async moveFile(key: string, newKey: string, mode: number): Promise<Response> {
    const file = await this.copyFile(key, newKey, mode);
    await this.deleteFile(key);
    return { raw: file };
  }

  async deleteFile(key: string): Promise<DeleteResponse> {
    const result = await fsAsync.unlinkAsync(this.path(key));
    return { raw: result, isDeleted: true };
  }

  async deleteFiles(keys: string[]): Promise<DeleteResponse> {
    const results = await P.map(keys, key => this.deleteFile(key));
    return { raw: results, isDeleted: true };
  }

  listFiles(key: string): Promise<string[]> {
    const readdir = fsAsync.readdirAsync(this.path(key), { withFileTypes: true });
    return P.map(readdir, fileName => path.join(key, String(fileName)))
      .catch(err => isNotFound(err) ? null : Promise.reject(err));
  }

  fileExists(key: string): Promise<ExistsResponse> {
    return Promise.resolve({
      exists: exists(this.path(key)),
      raw: undefined
    });
  }

  getFileUrl(key: string): Promise<string> {
    return Promise.resolve(`${this.#origin}/${key}`);
  }
}

export default { create: FilesystemStorage.create };
