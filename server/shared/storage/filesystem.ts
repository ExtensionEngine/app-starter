import fs, { createReadStream, createWriteStream, promises as fsAsync } from 'fs';
import IStorage, {
  ContentResponse,
  DeleteResponse,
  FileListResponse
} from './interface';
import { Config } from '../../config';
import expandPath from 'untildify';
import mkdirp from 'mkdirp';
import P from 'bluebird';
import path from 'path';

interface SystemError extends Error {
  code: string;
}

const isNotFound = (err: SystemError): boolean => err.code === 'ENOENT';
const resolvePath = (str: string): string => path.resolve(expandPath(str));

class FilesystemStorage implements IStorage {
  #rootPath: string;
  #serverUrl: string;

  constructor({ server, storage }: Config) {
    const config = storage.filesystem;
    this.#serverUrl = server.serverUrl;
    this.#rootPath = resolvePath(config.path);
  }

  getFile(key: string): Promise<ContentResponse<string>> {
    return fsAsync.readFile(this.path(key))
      .then(data => ({ content: data.toString(), raw: data }))
      .catch(err => isNotFound(err) ? null : Promise.reject(err));
  }

  createReadStream(key: string): NodeJS.ReadableStream {
    return createReadStream(this.path(key));
  }

  async createWriteStream(key: string): Promise<NodeJS.WritableStream> {
    const filepath = this.path(key);
    const dirname = path.dirname(filepath);
    await fsAsync.mkdir(dirname, { recursive: true });
    return createWriteStream(filepath);
  }

  async saveFile(key: string, data: Buffer): Promise<void> {
    const filePath = this.path(key);
    await mkdirp(path.dirname(filePath));
    await fsAsync.writeFile(filePath, data);
  }

  async copyFile(key: string, newKey: string): Promise<void> {
    const src = this.path(key);
    const dest = this.path(newKey);
    await mkdirp(path.dirname(dest));
    await fsAsync.copyFile(src, dest);
  }

  async moveFile(key: string, newKey: string): Promise<void> {
    await this.copyFile(key, newKey);
    await this.deleteFile(key);
  }

  async deleteFile(key: string): Promise<DeleteResponse> {
    const exists = await this.fileExists(key);
    if (exists) await fsAsync.unlink(this.path(key));
    return { isDeleted: true };
  }

  async deleteFiles(keys: string[]): Promise<DeleteResponse> {
    await P.map(keys, key => this.deleteFile(key));
    return { isDeleted: true };
  }

  listFiles(key: string): Promise<FileListResponse[]> {
    const readdir = fsAsync.readdir(this.path(key), { withFileTypes: true });
    return P.map(readdir, file => ({ path: path.join(key, String(file.name)) }))
      .catch(err => isNotFound(err) ? null : Promise.reject(err));
  }

  fileExists(key: string): Promise<boolean> {
    const exists = fs.existsSync(this.path(key));
    return Promise.resolve(exists);
  }

  getFileUrl(key: string): Promise<string> {
    return Promise.resolve(`${this.#serverUrl}/${key}`);
  }

  private path(...segments): string {
    return path.join(this.#rootPath, ...segments);
  }
}

export default FilesystemStorage;
