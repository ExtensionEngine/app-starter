import axios from 'axios';
import { UNAUTHORIZED } from 'http-status';

const baseURL = process.env.VUE_APP_API_PATH;

const config = {
  baseURL,
  withCredentials: true
};

// Instance of axios to be used for all API requests.
const client = axios.create(config);

Object.defineProperty(client, 'base', {
  get() {
    if (!this.base_) this.base_ = axios.create(config);
    return this.base_;
  }
});

client.interceptors.response.use(res => res, err => {
  if (err.response.status !== UNAUTHORIZED) throw err;
  return window.location.reload();
});

export default client;
