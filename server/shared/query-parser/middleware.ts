import { NextFunction, Request, Response } from 'express';
import { OrderBy, Pagination } from './types';
import { ParsedQs } from 'qs';
import { QueryOrder } from '@mikro-orm/core';
import transform from 'lodash/transform';
import yn from 'yn';

function queryParser(req: Request, _: Response, next: NextFunction): void {
  const { force, archived } = req.query;
  req.parsedQuery = { includeArchived: yn(archived), force: yn(force) };
  req.pagination = parsePagination(req.query);
  next();
}

export default queryParser;

function parsePagination(query: ParsedQs): Pagination {
  const { limit, offset } = query;
  return {
    limit: Number(limit) || 100,
    offset: Number(offset) || 0,
    orderBy: parseOrder(query)
  };
}

function parseOrder(query: ParsedQs): OrderBy {
  const { sortBy = 'createdAt', sortOrder = 'ASC' } = query;
  const orderAttributes = Array.isArray(sortBy) ? sortBy : [sortBy];
  return transform(orderAttributes, (orderBy, attr) => {
    orderBy[String(attr)] = QueryOrder[String(sortOrder)];
  }, {});
}
