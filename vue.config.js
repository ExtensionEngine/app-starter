'use strict';

require('dotenv').config();

const path = require('path');

const { AUTH_JWT_SCHEME, SERVER_PORT } = process.env;

const devServerUrl = `http://localhost:${SERVER_PORT}`;

const outputDir = path.resolve(__dirname, './dist/client');

const aliases = {
  '@': path.resolve(__dirname, './client')
};

const envs = {
  VUE_APP_API_PATH: '/api',
  VUE_APP_AUTH_JWT_SCHEME: AUTH_JWT_SCHEME
};

Object.assign(process.env, envs);

module.exports = {
  // https://github.com/vuejs/vue-cli/issues/2176
  // parallel: !process.env.CIRCLECI,
  transpileDependencies: ['vuetify'],
  outputDir,
  devServer: {
    headers: {
      'X-Powered-By': 'Webpack DevSever'
    },
    proxy: {
      '/api': { target: devServerUrl, ws: false }
    },
    port: 8081
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: `
          @import "./client/common/assets/stylesheets/_variables.scss";
        `
      }
    }
  },
  pages: {
    admin: {
      filename: 'admin/index.html',
      entry: './client/admin/main.js',
      title: 'Admin panel'
    },
    main: {
      filename: 'index.html',
      entry: './client/main/index.js',
      title: 'Main panel'
    }
  },
  chainWebpack(config) {
    config.resolve.alias.merge(aliases);
  }
};
