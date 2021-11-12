import { QueryOrder } from '@mikro-orm/core';

export type OrderBy = {
  [key: string]: QueryOrder
};

export interface ParsedQuery {
  force: boolean;
  includeArchived: boolean;
}

export interface Pagination {
  limit: number;
  offset: number;
  orderBy: OrderBy;
}
