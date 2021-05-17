import get from 'lodash/get';
import head from 'lodash/head';

export function extractData(res) {
  return res.data.data;
}

export function processParams(opts) {
  const page = get(opts, 'page', 1);
  const limit = get(opts, 'itemsPerPage', 100);
  const sortBy = head(opts.sortBy);
  const sortOrder = head(opts.sortDesc);
  const params = {
    sortBy: sortBy || 'id',
    sortOrder: sortOrder ? 'DESC' : 'ASC',
    offset: (page - 1) * limit,
    limit: limit === -1 ? null : limit
  };
  if (opts.filter) params.filter = opts.filter;
  return Object.assign(params, opts.params);
}
