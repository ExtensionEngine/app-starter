import { QueryOrder } from '@mikro-orm/core';

type orderBy = {
  [key: string]: QueryOrder
};

export interface ParsedQuery {
  force: boolean;
  includeArchived: boolean;
}

export interface Pagination {
  limit: number;
  offset: number;
  orderBy: orderBy;
}
