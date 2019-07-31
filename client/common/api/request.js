import axios from 'axios';
import HttpStatus from 'http-status';

const config = {
  baseURL: process.env.API_PATH,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
};

// Instance of axios to be used for all API requests.
const client = axios.create(config);

Object.defineProperty(client, 'base', {
  get() {
    if (!this.base_) this.base_ = axios.create(config);
    return this.base_;
  }
});

client.interceptors.request.use(config => {
  const token = localStorage.getItem('LMS_TOKEN');
  if (token) {
    config.headers['Authorization'] = `JWT ${token}`;
    return config;
  }
  delete config.headers['Authorization'];
  return config;
});

client.interceptors.response.use(res => res, err => {
  if (!err.response || !err.response.status === HttpStatus.FORBIDDEN) {
    throw err;
  }
  localStorage.removeItem('LMS_TOKEN');
  location.reload();
});

export default client;
