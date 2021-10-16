import IStorage, {
  ContentResponse,
  DeleteResponse,
  FileListResponse,
  Response
} from './interface';
import { Config } from '../../config';
import miss from 'mississippi';
import path from 'path';
import S3 from 'aws-sdk/clients/s3';

const isNotFound = (err: any): boolean => err.code === 'NoSuchKey';

class Amazon implements IStorage {
  #bucket: string;
  #client: S3;

  constructor(config: Config) {
    const amazonConfig = config.storage.amazon;

    const s3Config = {
      accessKeyId: amazonConfig.key,
      secretAccessKey: amazonConfig.secret,
      region: amazonConfig.region,
      signatureVersion: 'v4',
      apiVersion: '2006-03-01',
      maxRetries: 3
    };

    this.#bucket = amazonConfig.bucket;
    this.#client = new S3(s3Config);
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
  getFile(key: string): Promise<ContentResponse<string>> {
    const params = { Bucket: this.#bucket, Key: key };
    return this.#client.getObject(params).promise()
      .then(({ Body: data }) => ({ content: data.toString(), raw: data }))
      .catch(err => isNotFound(err) ? null : Promise.reject(err));
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
  createReadStream(key: string): NodeJS.ReadableStream {
    const params = { Bucket: this.#bucket, Key: key };
    return this.#client.getObject(params).createReadStream();
  }

  // API docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
  createWriteStream(key: string): NodeJS.WritableStream {
    const throughStream = miss.through();
    const params = { Bucket: this.#bucket, Key: key, Body: throughStream };
    this.#client.upload(params, () => null);
    return throughStream;
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
  async saveFile(key: string, data: Buffer): Promise<Response> {
    const params = { Bucket: this.#bucket, Key: key, Body: data };
    const result = await this.#client.putObject(params).promise();
    return { raw: result };
  }

  // API docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#copyObject-property
  async copyFile(key: string, newKey: string): Promise<Response> {
    const params = {
      Bucket: this.#bucket,
      CopySource: this.path(`/${key}`),
      Key: newKey
    };
    const result = await this.#client.copyObject(params).promise();
    return { raw: result };
  }

  async moveFile(key: string, newKey: string): Promise<Response> {
    const result = await this.copyFile(key, newKey);
    await this.deleteFile(key);
    return { raw: result };
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObject-property
  async deleteFile(key: string): Promise<DeleteResponse> {
    const params = { Bucket: this.#bucket, Key: key };
    await this.#client.deleteObject(params).promise();
    return { isDeleted: true };
  }

  // API docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObjects-property
  async deleteFiles(keys: string[]): Promise<DeleteResponse> {
    const objects = keys.map(key => ({ Key: key }));
    const params = {
      Bucket: this.#bucket,
      Delete: { Objects: objects }
    };
    await this.#client.deleteObjects(params).promise();
    return { isDeleted: true };
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjects-property
  async listFiles(key: string): Promise<FileListResponse[]> {
    const params = { Bucket: this.#bucket, Prefix: key };
    const { Contents: files } = await this.#client.listObjectsV2(params).promise();
    return files.map(file => ({ raw: file, path: file.Key }));
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#headObject-property
  fileExists(key: string): Promise<boolean> {
    const params = { Bucket: this.#bucket, Key: key };
    return this.#client.headObject(params).promise()
      .then(Boolean)
      .catch(() => false);
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property
  getFileUrl(key: string): Promise<string> {
    const params = { Bucket: this.#bucket, Key: key, Expires: 3600 };
    return this.#client.getSignedUrlPromise('getObject', params);
  }

  private path(...segments): string {
    return path.join(this.#bucket, ...segments);
  }
}

export default Amazon;
