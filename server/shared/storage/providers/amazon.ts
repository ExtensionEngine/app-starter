import { AmazonWebServicesS3Storage } from '@slynova/flydrive-s3';
import { StorageConfig } from '../../../config/storage';
import { StorageManager } from '@slynova/flydrive';

function createAmazonStorage(config: StorageConfig): AmazonWebServicesS3Storage {
  const storage = new StorageManager({
    disks: {
      s3: { driver: 's3', config: config.amazon }
    }
  });
  storage.registerDriver('s3', AmazonWebServicesS3Storage);
  return storage.disk<AmazonWebServicesS3Storage>('s3');
}

export default createAmazonStorage;
