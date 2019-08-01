import { extractData, processParams } from '@/common/api/helpers';
import path from 'path';
import request from '@/common/api/request';

const urls = {
  base: '/users',
  resource: ({ id }) => path.join(urls.base, `${id}`),
  invite: ({ id }) => path.join(urls.base, `${id}`, '/invite'),
  import: () => path.join(urls.base, '/import')
};

function fetch(params = {}) {
  return request.get(urls.base, { params: processParams(params) })
    .then(extractData);
}

function create(item) {
  return request.post(urls.base, item).then(extractData);
}

function update(item) {
  return request.patch(urls.resource(item), item).then(extractData);
}

function remove(item) {
  return request.delete(urls.resource(item));
}

function invite(item) {
  return request.post(urls.invite(item));
}

function bulkImport(items) {
  return request.post(urls.import(), items, { responseType: 'blob' });
}

export default {
  fetch,
  create,
  update,
  remove,
  invite,
  bulkImport
};
