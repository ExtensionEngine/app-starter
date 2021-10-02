import { Pagination } from '../middleware/pagination';
import User from '../user/model';

declare module 'express' {
  interface Request {
    user: User;
    targetUser: User;
    pagination: Pagination;
  }
}
