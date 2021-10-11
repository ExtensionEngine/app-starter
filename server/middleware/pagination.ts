import { NextFunction, Request, Response } from 'express';
import { QueryFlag, QueryOrder } from '@mikro-orm/core';
import autobind from 'auto-bind';
import { IMiddleware } from '../types/middleware';
import yn from 'yn';

type orderBy = {
  [key: string]: QueryOrder
}

export interface Pagination {
  limit: number;
  offset: number;
  orderBy: orderBy;
  flags: QueryFlag[];
  showArchived: boolean;
}

class ParsePaginationMiddleware implements IMiddleware {
  constructor() {
    autobind(this);
  }

  async handle(req: Request, _: Response, next: NextFunction): Promise<void> {
    const { limit, offset, sortBy = 'createdAt', sortOrder = 'ASC' } = req.query;
    const archivedKeywords = ['archived', 'deleted', 'destroyed'];
    const showArchived = archivedKeywords.some(it => yn(req.query[it]));
    req.pagination = {
      limit: Number(limit) || 100,
      offset: Number(offset) || 0,
      orderBy: { [String(sortBy)]: QueryOrder[String(sortOrder)] },
      flags: [QueryFlag.PAGINATE],
      showArchived
    };
    next();
  }
}

export default ParsePaginationMiddleware;
