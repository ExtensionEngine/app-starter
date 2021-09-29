import { NextFunction, Request, Response } from 'express';
import { QueryOrder, QueryFlag } from '@mikro-orm/core';

export function parsePagination(req: Request, _: Response, next: NextFunction): void {
  const { limit, offset, sortBy = 'createdAt', sortOrder = 'ASC' } = req.query;
  req.pagination = {
    limit: Number(limit) || 100,
    offset: Number(offset) || 0,
    orderBy: { [String(sortBy)]: QueryOrder[String(sortOrder)] },
    flags: [QueryFlag.PAGINATE]
  };
  next();
}
