import { NextFunction, Request, Response } from 'express';
import { Pagination } from './types';
import { ParsedQs } from 'qs';
import { QueryOrder } from '@mikro-orm/core';
import yn from 'yn';

function queryParser(req: Request, _: Response, next: NextFunction): void {
  const { force, archived } = req.query;
  req.parsedQuery = { includeArchived: yn(archived), force: yn(force) };
  req.pagination = parsePagination(req.query);
  next();
}

export default queryParser;

function parsePagination(query: ParsedQs): Pagination {
  const { limit, offset, sortBy = 'createdAt', sortOrder = 'ASC' } = query;
  return {
    limit: Number(limit) || 100,
    offset: Number(offset) || 0,
    orderBy: { [String(sortBy)]: QueryOrder[String(sortOrder)] }
  };
}
