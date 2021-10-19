import { extractData } from './helpers';
import path from 'path';
import request from './request';

const urls = {
  root: '/auth',
  login: () => path.join(urls.root, 'login'),
  logout: () => path.join(urls.root, 'logout'),
  me: () => path.join(urls.root, 'me'),
  forgotPassword: () => path.join(urls.root, 'forgot-password'),
  resetPassword: () => path.join(urls.root, 'reset-password')
};

function login(credentials) {
  return request.base.post(urls.login(), credentials)
    .then(extractData);
}

function logout() {
  return request.get(urls.logout());
}

function forgotPassword(email) {
  return request.post(urls.forgotPassword(), { email });
}

function resetPassword(token, password) {
  return request.base.post(urls.resetPassword(), { token, password });
}

function getUserInfo() {
  return request.base.get(urls.me())
    .then(extractData);
}

export default {
  login,
  logout,
  forgotPassword,
  resetPassword,
  getUserInfo
};
