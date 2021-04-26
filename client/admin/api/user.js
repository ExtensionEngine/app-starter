import { extractData, processParams } from '@/common/api/helpers';
import request from '@/common/api/request';
import urljoin from 'url-join';

const urls = {
  base: '/users',
  resource: ({ id }) => urljoin(urls.base, `${id}`),
  invite: ({ id }) => urljoin(urls.base, `${id}`, '/invite'),
  import: () => urljoin(urls.base, '/import')
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
