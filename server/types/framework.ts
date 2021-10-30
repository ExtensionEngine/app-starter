import { File } from 'multer';
import { Pagination } from '../middleware/pagination';
import User from '../user/model';

declare module 'express' {
  interface Request {
    user: User;
    pagination: Pagination;
    file: File;
  }
}
