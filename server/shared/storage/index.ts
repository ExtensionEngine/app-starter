import * as providers from './providers';
import { AmazonWebServicesS3Storage } from '@slynova/flydrive-s3';
import autobind from 'auto-bind';
import { Config } from '../../config';
import { LocalFileSystemStorage } from '@slynova/flydrive';

type Provider = LocalFileSystemStorage | AmazonWebServicesS3Storage;

class Storage {
  provider: Provider;

  constructor({ storage: storageConfig }: Config) {
    this.provider = providers[storageConfig.provider](storageConfig);
    autobind(this);
  }
}

export default Storage;
