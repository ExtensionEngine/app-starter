import path from 'path';
import request from './request';

const urls = {
  base: '/users',
  login: () => path.join(urls.base, '/login'),
  forgotPassword: () => path.join(urls.base, '/forgot-password'),
  resetPassword: () => path.join(urls.base, '/reset-password')
};

function login(credentials) {
  return request.base
    .post(urls.login(), credentials)
    .then(res => res.data.data)
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
