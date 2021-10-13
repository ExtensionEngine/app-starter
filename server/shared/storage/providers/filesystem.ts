import { LocalFileSystemStorage, StorageManager } from '@slynova/flydrive';
import expandPath from 'untildify';
import path from 'path';
import { StorageConfig } from '../../../config/storage';

const resolvePath = (str: string): string => path.resolve(expandPath(str));

function createFilesystemStorage(config: StorageConfig): LocalFileSystemStorage {
  const storage = new StorageManager({
    disks: {
      local: {
        driver: 'local',
        config: { root: resolvePath(config.filesystem.path) }
      }
    }
  });
  return storage.disk<LocalFileSystemStorage>('local');
}

export default createFilesystemStorage;
