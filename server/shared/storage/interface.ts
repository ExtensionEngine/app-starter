export interface Response {
  raw: unknown;
}

export interface ContentResponse<ContentType> extends Response {
  content: ContentType;
}

export interface FileListResponse {
  path: string;
}

export interface DeleteResponse {
  isDeleted: boolean | null;
}

interface IStorage {
  getFile(key: string): Promise<ContentResponse<string>>;
  createReadStream(key: string): NodeJS.ReadableStream;
  createWriteStream(key: string): Promise<NodeJS.WritableStream> | NodeJS.WritableStream;
  saveFile(key: string, data: Buffer): Promise<Response>;
  copyFile(key: string, newKey: string): Promise<Response>;
  moveFile(key: string, newKey: string): Promise<Response>;
  deleteFile(key: string): Promise<DeleteResponse>;
  deleteFiles(keys: string[]): Promise<DeleteResponse>;
  listFiles(key: string): Promise<FileListResponse[]>;
  fileExists(key: string): Promise<boolean>;
  getFileUrl(key: string): Promise<string>;
}

export default IStorage;
