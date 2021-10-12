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

class FilesystemStorage {
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

  path(...segments): string {
    segments = [this.#rootPath, ...segments];
    return path.join(...segments);
  }

  getFile(key: string): Promise<Buffer> {
    return fsAsync.readFileAsync(this.path(key))
      .catch(err => isNotFound(err) ? null : Promise.reject(err));
  }

  createReadStream(key: string, options = {}): fs.ReadStream {
    return fsAsync.createReadStream(this.path(key), options);
  }

  async saveFile(key: string, data): Promise<undefined> {
    const filePath = this.path(key);
    await mkdirp(path.dirname(filePath));
    return fsAsync.writeFileAsync(filePath, data);
  }

  createWriteStream(key: string, options = {}): fs.WriteStream {
    const filepath = this.path(key);
    const dirname = path.dirname(filepath);
    // TODO: Replace with async mkdir
    fsAsync.mkdirSync(dirname, { recursive: true });
    return fsAsync.createWriteStream(filepath, options);
  }

  async copyFile(key: string, newKey: string, options): Promise<undefined> {
    const src = this.path(key);
    const dest = this.path(newKey);
    await mkdirp(path.dirname(dest));
    return fsAsync.copyFileAsync(src, dest, options);
  }

  async moveFile(key: string, newKey: string, options): Promise<undefined> {
    const file = await this.copyFile(key, newKey, options);
    await this.deleteFile(key);
    return file;
  }

  deleteFile(key: string): Promise<undefined> {
    return fsAsync.unlinkAsync(this.path(key));
  }

  deleteFiles(keys: string[]): Promise<undefined[]> {
    return P.map(keys, key => this.deleteFile(key));
  }

  listFiles(key: string, options) {
    const readdir = fsAsync.readdirAsync(this.path(key), options);
    return P.map(readdir, fileName => path.join(key, String(fileName)))
      .catch(err => isNotFound(err) ? null : Promise.reject(err));
  }

  fileExists(key: string): boolean {
    return exists(this.path(key));
  }

  getFileUrl(key: string): Promise<string> {
    return P.resolve(`${this.#origin}/${key}`);
  }
}

export default {
  schema,
  create: FilesystemStorage.create
};
