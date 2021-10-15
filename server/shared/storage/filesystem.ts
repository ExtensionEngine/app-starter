import { createReadStream, createWriteStream, promises as fs } from 'fs';
import IStorage, {
  ContentResponse,
  DeleteResponse,
  ExistsResponse,
  FileListResponse,
  Response
} from './interface';
import { Config } from '../../config';
import exists from 'path-exists';
import expandPath from 'untildify';
import { Filesystem as FilesystemConfig } from '../../config/storage';
import mkdirp from 'mkdirp';
import P from 'bluebird';
import path from 'path';

const isNotFound = (err: any): boolean => err.code === 'ENOENT';
const resolvePath = (str: string): string => path.resolve(expandPath(str));

class FilesystemStorage implements IStorage {
  #rootPath: string;
  #origin: string;

  constructor({ server, storage }: Config) {
    const config = storage.filesystem as FilesystemConfig;
    this.#origin = server.origin;
    this.#rootPath = resolvePath(config.path);
  }

  private path(...segments): string {
    segments = [this.#rootPath, ...segments];
    return path.join(...segments);
  }

  getFile(key: string): Promise<ContentResponse<string>> {
    return fs.readFile(this.path(key))
      .then(data => ({ content: data.toString(), raw: data }))
      .catch(err => isNotFound(err) ? null : Promise.reject(err));
  }

  createReadStream(key: string): NodeJS.ReadableStream {
    return createReadStream(this.path(key));
  }

  async saveFile(key: string, data: Buffer): Promise<Response> {
    const filePath = this.path(key);
    await mkdirp(path.dirname(filePath));
    const result = await fs.writeFile(filePath, data);
    return { raw: result };
  }

  async createWriteStream(key: string): Promise<Response> {
    const filepath = this.path(key);
    const dirname = path.dirname(filepath);
    await fs.mkdir(dirname, { recursive: true });
    const result = createWriteStream(filepath);
    return { raw: result };
  }

  async copyFile(key: string, newKey: string): Promise<Response> {
    const src = this.path(key);
    const dest = this.path(newKey);
    await mkdirp(path.dirname(dest));
    const result = await fs.copyFile(src, dest);
    return { raw: result };
  }

  async moveFile(key: string, newKey: string): Promise<Response> {
    const file = await this.copyFile(key, newKey);
    await this.deleteFile(key);
    return { raw: file.raw };
  }

  async deleteFile(key: string): Promise<DeleteResponse> {
    const result = await fs.unlink(this.path(key));
    return { raw: result, isDeleted: true };
  }

  async deleteFiles(keys: string[]): Promise<DeleteResponse> {
    const results = await P.map(keys, key => this.deleteFile(key));
    return { raw: results, isDeleted: true };
  }

  listFiles(key: string): Promise<FileListResponse[]> {
    const readdir = fs.readdir(this.path(key), { withFileTypes: true });
    return P.map(readdir, file => ({
      raw: file,
      path: path.join(key, String(file.name))
    }))
    .catch(err => isNotFound(err) ? null : Promise.reject(err));
  }

  async fileExists(key: string): Promise<ExistsResponse> {
    return Promise.resolve({
      exists: await exists(this.path(key)),
      raw: undefined
    });
  }

  getFileUrl(key: string): Promise<string> {
    return Promise.resolve(`${this.#origin}/${key}`);
  }
}

export default FilesystemStorage;
