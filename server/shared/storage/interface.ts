export type ContentResponse<ContentType> = { content: ContentType, raw: Buffer };

export type FileListResponse = { path: string };

export type DeleteResponse = { isDeleted: boolean | null };

interface IStorage {
  getFile(key: string): Promise<ContentResponse<string>>;
  createReadStream(key: string): NodeJS.ReadableStream;
  createWriteStream(key: string): Promise<NodeJS.WritableStream> | NodeJS.WritableStream;
  saveFile(key: string, data: Buffer): Promise<void>;
  copyFile(key: string, newKey: string): Promise<void>;
  moveFile(key: string, newKey: string): Promise<void>;
  deleteFile(key: string): Promise<DeleteResponse>;
  deleteFiles(keys: string[]): Promise<DeleteResponse>;
  listFiles(key: string): Promise<FileListResponse[]>;
  fileExists(key: string): Promise<boolean>;
  getFileUrl(key: string): Promise<string>;
}

export default IStorage;
