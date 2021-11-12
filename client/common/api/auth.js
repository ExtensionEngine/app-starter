import { extractData } from '@/common/api/helpers';
import request from './request';
import urljoin from 'url-join';

const urls = {
  base: '/users',
  login: () => urljoin(urls.base, 'login'),
  forgotPassword: () => urljoin(urls.base, 'forgot-password'),
  resetPassword: () => urljoin(urls.base, 'reset-password')
};

function login(credentials) {
  return request.base
    .post(urls.login(), credentials)
    .then(extractData)
    .then(({ token, user }) => {
      request.auth.token = token;
      return user;
    });
}

function logout() {
  request.auth.token = null;
  // TODO: Add server side invalidation
  return Promise.resolve(true);
}

function forgotPassword(email) {
  return request.post(urls.forgotPassword(), { email });
}

function resetPassword(body) {
  return request.post(urls.resetPassword(), body);
}

export default {
  login,
  logout,
  forgotPassword,
  resetPassword
};
