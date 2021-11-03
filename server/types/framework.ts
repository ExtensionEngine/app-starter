import { Pagination, ParsedQuery } from '../shared/query-parser/types';
import { File } from 'multer';
import User from '../user/model';

declare module 'express' {
  interface Request {
    user: User;
    pagination: Pagination;
    parsedQuery: ParsedQuery
    file: File;
  }
}
