import IStorage, {
  ContentResponse,
  DeleteResponse,
  ExistsResponse,
  Response
} from '../interface';
import S3, { ClientConfiguration } from 'aws-sdk/clients/s3';
import { Config } from '../../../config';
import Joi from 'joi';
import miss from 'mississippi';
import path from 'path';
import { validateConfig } from '../validation';

const noop = () => null;
const isNotFound = (err: any): boolean => err.code === 'NoSuchKey';

const schema = Joi.object().keys({
  region: Joi.string().required(),
  bucket: Joi.string().required(),
  key: Joi.string().required(),
  secret: Joi.string().required()
});

class Amazon implements IStorage {
  #bucket: string;
  #client: S3;

  constructor(config: Config) {
    const amazonConfig = validateConfig(config.storage.amazon, schema);

    const s3Config = {
      signatureVersion: 'v4',
      accessKeyId: amazonConfig.key,
      secretAccessKey: amazonConfig.secret,
      region: amazonConfig.region,
      apiVersion: '2006-03-01',
      maxRetries: 3
    } as ClientConfiguration;

    this.#bucket = amazonConfig.bucket;
    this.#client = new S3(s3Config);
  }

  static create(config) {
    return new Amazon(config);
  }

  private path(...segments): string {
    segments = [this.#bucket, ...segments];
    return path.join(...segments);
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

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
  async saveFile(key: string, data: string | Buffer): Promise<Response> {
    const params = { Bucket: this.#bucket, Key: key, Body: data };
    await this.#client.putObject(params).promise();
    return { raw: undefined };
  }

  // API docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
  async createWriteStream(key: string): Promise<Response> {
    const throughStream = miss.through();
    const params = { Bucket: this.#bucket, Key: key, Body: throughStream };
    await this.#client.upload(params).promise();
    return { raw: throughStream };
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
    const result = await this.#client.deleteObject(params).promise();
    return { raw: result, isDeleted: true };
  }

  // API docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObjects-property
  async deleteFiles(keys: string[]): Promise<DeleteResponse> {
    const objects = keys.map(key => ({ Key: key }));
    if (!keys.length) return Promise.resolve({ raw: null, isDeleted: false });
    const params = {
      Bucket: this.#bucket,
      Delete: { Objects: objects }
    };
    const results = await this.#client.deleteObjects(params).promise();
    return { raw: results, isDeleted: true };
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjects-property
  async listFiles(key: string): Promise<string[]> {
    const params = { Bucket: this.#bucket, Prefix: key };
    const { Contents: files } = await this.#client.listObjectsV2(params).promise();
    return files.map(file => file.Key);
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#headObject-property
  fileExists(key: string): Promise<ExistsResponse> {
    const params = { Bucket: this.#bucket, Key: key };
    return this.#client.headObject(params).promise()
      .then(result => ({ exists: true, raw: result }))
      .catch(err => ({ exists: false, raw: err }));
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property
  getFileUrl(key: string): Promise<string> {
    const params = { Bucket: this.#bucket, Key: key, Expires: 3600 };
    return this.#client.getSignedUrlPromise('getObject', params);
  }
}

export default { create: Amazon.create };
