'use strict';
import { Config } from '../../../config';
import exists from 'path-exists';
import expandPath from 'untildify';
import fs from 'fs';
import { Filesystem as IFilesystem } from '../../../config/storage';
import Joi from 'joi';
import mkdirp from 'mkdirp';
import P from 'bluebird';
import path from 'path';

const fsAsync = P.promisifyAll(fs);

const isNotFound = err => err.code === 'ENOENT';
const resolvePath = (str: string) => path.resolve(expandPath(str));

function validateConfig(config: IFilesystem, schema): IFilesystem {
  return schema.validate(config, { stripUnknown: true }, err => {
    if (err) throw new Error('Unsupported config structure');
  });
}

const schema = Joi.object().keys({
  path: Joi.string().required()
});

class FilesystemStorage {
  #root: string;
  #config: Config;

  constructor(config: Config) {
    const filesystemConfig: IFilesystem = validateConfig(config.storage.filesystem, schema);
    this.#config = config;
    this.#root = resolvePath(filesystemConfig.path);
  }

  static create(config) {
    return new FilesystemStorage(config);
  }

  path(...segments): string {
    segments = [this.#root, ...segments];
    return path.join(...segments);
  }

  getFile(key: string) {
    return fsAsync.readFileAsync(this.path(key))
      .catch(err => {
        if (isNotFound(err)) return null;
        return Promise.reject(err);
      });
  }

  createReadStream(key: string, options = {}) {
    return fsAsync.createReadStream(this.path(key), options);
  }

  async saveFile(key: string, data) {
    const filePath = this.path(key);
    await mkdirp(path.dirname(filePath));
    return fsAsync.writeFileAsync(filePath, data);
  }

  createWriteStream(key: string, options = {}) {
    const filepath = this.path(key);
    const dirname = path.dirname(filepath);
    // TODO: Replace with async mkdir
    fsAsync.mkdirSync(dirname, { recursive: true });
    return fsAsync.createWriteStream(filepath, options);
  }

  async copyFile(key: string, newKey: string, options) {
    const src = this.path(key);
    const dest = this.path(newKey);
    await mkdirp(path.dirname(dest));
    return fsAsync.copyFileAsync(src, dest, options);
  }

  moveFile(key: string, newKey: string, options) {
    return this.copyFile(key, newKey, options)
      .then(file => this.deleteFile(key).then(() => file));
  }

  deleteFile(key: string) {
    return fsAsync.unlinkAsync(this.path(key));
  }

  deleteFiles(keys: string[]) {
    return P.map(keys, key => this.deleteFile(key));
  }

  listFiles(key: string, options) {
    const readdir = fsAsync.readdirAsync(this.path(key), options);
    return P.map(readdir, fileName => path.join(key, String(fileName)))
      .catch(err => isNotFound(err) ? null : Promise.reject(err));
  }

  fileExists(key: string) {
    return exists(this.path(key));
  }

  getFileUrl(key: string) {
    return P.resolve(`${this.#config.server.origin}/${key}`);
  }
}

export default {
  schema,
  create: FilesystemStorage.create
};
