export interface Response {
  raw: unknown;
}

export interface ExistsResponse extends Response {
  exists: boolean;
}

export interface ContentResponse<ContentType> extends Response {
  content: ContentType;
}

export interface FileListResponse extends Response {
  path: string;
}

export interface DeleteResponse extends Response {
  isDeleted: boolean | null;
}

interface IStorage {
  getFile(key: string): Promise<ContentResponse<string>>;
  createReadStream(key: string): NodeJS.ReadableStream;
  saveFile(key: string, data: string): Promise<Response>;
  createWriteStream(key: string): Promise<Response> | Response;
  copyFile(key: string, newKey: string, mode?: number): Promise<Response>;
  moveFile(key: string, newKey: string, mode?: number): Promise<Response>;
  deleteFile(key: string): Promise<DeleteResponse>
  deleteFiles(keys: string[]): Promise<DeleteResponse>
  listFiles(key: string): Promise<string[]>
  fileExists(key: string): Promise<ExistsResponse>
  getFileUrl(key: string): Promise<string>
}

export default IStorage;
