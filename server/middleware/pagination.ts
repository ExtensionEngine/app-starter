import { NextFunction, Request, Response } from 'express';
import { QueryFlag, QueryOrder } from '@mikro-orm/core';
import yn from 'yn';

type orderBy = {
  [key: string]: QueryOrder
}

export interface Pagination {
  limit: number;
  offset: number;
  orderBy: orderBy;
  flags: QueryFlag[];
  showArchived: boolean
}

export function parsePagination(req: Request, _: Response, next: NextFunction): void {
  const { limit, offset, sortBy = 'createdAt', sortOrder = 'ASC' } = req.query;
  const paranoidKeywords = ['archived', 'deleted', 'destroyed'];
  const showArchived = paranoidKeywords.some(it => yn(req.query[it]));
  req.pagination = {
    limit: Number(limit) || 100,
    offset: Number(offset) || 0,
    orderBy: { [String(sortBy)]: QueryOrder[String(sortOrder)] },
    flags: [QueryFlag.PAGINATE],
    showArchived
  };
  next();
}
