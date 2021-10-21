import IStorage, { ContentResponse, FileListResponse } from '../interface';
import { AWSError } from 'aws-sdk';
import { Config } from '../../../config';
import miss from 'mississippi';
import path from 'path';
import S3 from 'aws-sdk/clients/s3';

const isNotFound = (err: AWSError): boolean => {
  const errorCodes = ['NoSuchKey', 'NotFound'];
  return errorCodes.some(code => code === err.code);
};

const noop = () => null;

class Amazon implements IStorage {
  #bucket: string;
  #client: S3;

  constructor(config: Config) {
    this.#bucket = config.storage.amazon.bucket;

    // API docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html
    this.#client = new S3({
      accessKeyId: config.storage.amazon.key,
      secretAccessKey: config.storage.amazon.secret,
      region: config.storage.amazon.region,
      signatureVersion: 'v4',
      apiVersion: '2006-03-01',
      maxRetries: 3
    });
  }

  getFile(key: string): Promise<ContentResponse<string>> {
    const params = { Bucket: this.#bucket, Key: key };
    return this.#client.getObject(params).promise()
      .then(({ Body: data }) => ({ content: data.toString(), raw: data as Buffer }))
      .catch(err => isNotFound(err) ? null : Promise.reject(err));
  }

  createReadStream(key: string): NodeJS.ReadableStream {
    const params = { Bucket: this.#bucket, Key: key };
    return this.#client.getObject(params).createReadStream();
  }

  async createWriteStream(key: string): Promise<NodeJS.WritableStream> {
    const throughStream = miss.through();
    const params = { Bucket: this.#bucket, Key: key, Body: throughStream };
    this.#client.upload(params, noop);
    return Promise.resolve(throughStream);
  }

  async saveFile(key: string, data: Buffer): Promise<void> {
    const params = { Bucket: this.#bucket, Key: key, Body: data };
    await this.#client.putObject(params).promise();
  }

  async copyFile(key: string, newKey: string): Promise<void> {
    const { base, ...rest } = path.parse(key);
    const encodedSource = path.format({ base: encodeURIComponent(base), ...rest });
    const params = {
      Bucket: this.#bucket,
      CopySource: this.path(`/${encodedSource}`),
      Key: newKey
    };
    await this.#client.copyObject(params).promise();
  }

  async moveFile(key: string, newKey: string): Promise<void> {
    await this.copyFile(key, newKey);
    await this.deleteFile(key);
  }

  async deleteFile(key: string): Promise<void> {
    const params = { Bucket: this.#bucket, Key: key };
    await this.#client.deleteObject(params).promise();
  }

  async deleteFiles(keys: string[]): Promise<void> {
    const objects = keys.map(key => ({ Key: key }));
    const params = {
      Bucket: this.#bucket,
      Delete: { Objects: objects }
    };
    await this.#client.deleteObjects(params).promise();
  }

  async listFiles(key: string): Promise<FileListResponse[]> {
    const params = { Bucket: this.#bucket, Prefix: key };
    const { Contents: files } = await this.#client.listObjectsV2(params).promise();
    return files.map(file => ({ path: file.Key }));
  }

  fileExists(key: string): Promise<boolean> {
    const params = { Bucket: this.#bucket, Key: key };
    return this.#client.headObject(params).promise()
      .then(Boolean)
      .catch(err => isNotFound(err) ? false : Promise.reject(err));
  }

  getFileUrl(key: string): Promise<string> {
    const params = { Bucket: this.#bucket, Key: key, Expires: 3600 };
    return this.#client.getSignedUrlPromise('getObject', params);
  }

  private path(...segments): string {
    return path.join(this.#bucket, ...segments);
  }
}

export default Amazon;
