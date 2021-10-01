'use strict';

import S3, { ClientConfiguration } from 'aws-sdk/clients/s3';
import { Config } from '../../../config';
import Joi from 'joi';
import miss from 'mississippi';
import path from 'path';
import { Amazon as S3Config } from '../../../config/storage';

const noop = () => null;
const isNotFound = err => err.code === 'NoSuchKey';

const DEFAULT_EXPIRATION_TIME = 3600; // seconds

const schema = Joi.object().keys({
  region: Joi.string().required(),
  bucket: Joi.string().required(),
  key: Joi.string().required(),
  secret: Joi.string().required()
});

function validateConfig(config: S3Config, schema): S3Config {
  return schema.validate(config, { stripUnknown: true }, err => {
    if (err) throw new Error('Unsupported config structure');
  });
}

type SignedUrlOptions = {
  Bucket: string
  Key: string,
  expires: number
}

class Amazon {
  #bucket: string;
  #client: S3

  constructor(config: Config) {
    const amazonConfig: S3Config = validateConfig(config.storage.amazon, schema);

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
    const params = Object.assign(options, { Bucket: this.#bucket, Key: key });
    return this.#client.getObject(params).promise()
      .then(({ Body: data }) => data)
      .catch(err => {
        if (isNotFound(err)) return null;
        return Promise.reject(err);
      });
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
  createReadStream(key: string, options = {}) {
    const params = Object.assign(options, { Bucket: this.#bucket, Key: key });
    return this.#client.getObject(params).createReadStream();
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
  saveFile(key, data, options = {}) {
    const params = Object.assign(options, { Bucket: this.#bucket, Key: key, Body: data });
    return this.#client.putObject(params).promise();
  }

  // API docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
  createWriteStream(key: string, options = {}) {
    const throughStream = miss.through();
    const params = Object.assign(options, { Bucket: this.#bucket, Key: key, Body: throughStream });
    this.#client.upload(params, noop);
    return throughStream;
  }

  // API docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#copyObject-property
  copyFile(key: string, newKey: string, options = {}) {
    const params = Object.assign(options, { Bucket: this.#bucket }, {
      CopySource: this.path(`/${key}`),
      Key: newKey
    });
    return this.#client.copyObject(params).promise();
  }

  moveFile(key: string, newKey: string, options = {}) {
    return this.copyFile(key, newKey, options)
      .then(result => this.deleteFile(key).then(() => result));
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObject-property
  deleteFile(key: string, options = {}) {
    const params = Object.assign(options, { Bucket: this.#bucket, Key: key });
    return this.#client.deleteObject(params).promise();
  }

  // API docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObjects-property
  deleteFiles(keys: string[], options = {}) {
    const objects = keys.map(key => ({ Key: key }));
    if (!keys.length) return Promise.resolve();
    const params = Object.assign(options, { Bucket: this.#bucket, Delete: { Objects: objects } });
    return this.#client.deleteObjects(params).promise();
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjects-property
  listFiles(key: string, options = {}) {
    const params = Object.assign(options, { Bucket: this.#bucket, Prefix: key });
    return this.#client
      .listObjectsV2(params)
      .promise()
      .then(({ Contents: files }) => files.map(file => file.Key));
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#headObject-property
  fileExists(key: string, options = {}) {
    const params = { Bucket: this.#bucket, Key: key, ...options };
    return this.#client.headObject(params).promise();
  }

  // API docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property
  getFileUrl(key: string, options: SignedUrlOptions) {
    const expires = options.expires || DEFAULT_EXPIRATION_TIME;
    const params = Object.assign(options, { Bucket: this.#bucket, Key: key, Expires: expires });
    return this.#client.getSignedUrlPromise('getObject', params);
  }
}

export default {
  schema,
  create: Amazon.create
};
