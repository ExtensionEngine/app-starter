'use strict';

import S3, {
  ClientConfiguration,
  CopyObjectRequest,
  DeleteObjectRequest,
  DeleteObjectsRequest,
  GetObjectRequest,
  HeadObjectRequest,
  ListObjectsV2Request,
  PutObjectRequest
} from 'aws-sdk/clients/s3';
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

type SignedUrlOptions = {
  Bucket: string
  Key: string,
  expires: number
}

class Amazon {
  #bucket: string;
  #client: S3;

  constructor(config: Config) {
    const amazonConfig = validateConfig(config.storage.amazon, schema);

    const s3Config: ClientConfiguration = {
      signatureVersion: 'v4',
      accessKeyId: amazonConfig.key,
      secretAccessKey: amazonConfig.secret,
      region: amazonConfig.region,
      apiVersion: '2006-03-01',
      maxRetries: 3
    };

    this.#bucket = amazonConfig.bucket;
    this.#client = new S3(s3Config);
  }

  static create(config) {
    return new Amazon(config);
  }

  path(...segments): string {
    segments = [this.#bucket, ...segments];
    return path.join(...segments);
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
  getFile(key: string, options = {}) {
    const params: GetObjectRequest = { Bucket: this.#bucket, Key: key, ...options };
    return this.#client.getObject(params).promise()
      .then(({ Body: data }) => data)
      .catch(err => {
        if (isNotFound(err)) return null;
        return Promise.reject(err);
      });
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
  createReadStream(key: string, options = {}) {
    const params: GetObjectRequest = { Bucket: this.#bucket, Key: key, ...options };
    return this.#client.getObject(params).createReadStream();
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
  saveFile(key, data, options: PutObjectRequest) {
    const params: PutObjectRequest = {
      Bucket: this.#bucket, Key: key, Body: data, ...options
    };
    return this.#client.putObject(params).promise();
  }

  // API docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
  createWriteStream(key: string, options = {}) {
    const throughStream = miss.through();
    const params: PutObjectRequest = {
      Bucket: this.#bucket, Key: key, Body: throughStream, ...options
    };
    this.#client.upload(params, noop);
    return throughStream;
  }

  // API docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#copyObject-property
  copyFile(key: string, newKey: string, options = {}) {
    const params: CopyObjectRequest = Object.assign(options,
      { Bucket: this.#bucket },
      { CopySource: this.path(`/${key}`), Key: newKey }
    );
    return this.#client.copyObject(params).promise();
  }

  async moveFile(key: string, newKey: string, options) {
    const params: CopyObjectRequest = options || {};
    const result = await this.copyFile(key, newKey, params);
    await this.deleteFile(key);
    return result;
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObject-property
  deleteFile(key: string, options = {}) {
    const params: DeleteObjectRequest = { Bucket: this.#bucket, Key: key, ...options };
    return this.#client.deleteObject(params).promise();
  }

  // API docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObjects-property
  deleteFiles(keys: string[], options = {}) {
    const objects = keys.map(key => ({ Key: key }));
    if (!keys.length) return Promise.resolve();
    const params: DeleteObjectsRequest = Object.assign(options, {
      Bucket: this.#bucket,
      Delete: { Objects: objects }
    });
    return this.#client.deleteObjects(params).promise();
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjects-property
  async listFiles(key: string, options = {}) {
    const params: ListObjectsV2Request = { Bucket: this.#bucket, Prefix: key, ...options };
    const { Contents: files } = await this.#client.listObjectsV2(params).promise();
    return files.map(file => file.Key);
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#headObject-property
  fileExists(key: string, options = {}) {
    const params: HeadObjectRequest = { Bucket: this.#bucket, Key: key, ...options };
    return this.#client.headObject(params).promise();
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property
  getFileUrl(key: string, options: SignedUrlOptions) {
    const expires = options?.expires || 3600;
    const params = Object.assign(options, { Bucket: this.#bucket, Key: key, Expires: expires });
    return this.#client.getSignedUrlPromise('getObject', params);
  }
}

export default {
  schema,
  create: Amazon.create
};
