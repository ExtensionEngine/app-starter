'use strict';

require('dotenv').config();

const config = require('./server/config');
const { ESBuildMinifyPlugin } = require('esbuild-loader');
const path = require('path');

const serverUrl = `http://${config.ip}:${config.port}`;
const extensions = ['.vue'];
const aliases = {
  '@': path.resolve(__dirname, './client')
};

const devServer = {
  headers: {
    'X-Powered-By': 'Webpack DevSever'
  },
  proxy: {
    '/api': { target: serverUrl, ws: false }
  },
  port: 8081
};

module.exports = {
  pluginOptions: {
    cleanOutDir: {
      cleanOnceBeforeBuildPatterns: ['**/*', '!.gitkeep']
    },
    envs: {
      API_PATH: process.env.API_PATH,
      AUTH_JWT_SCHEME: process.env.AUTH_JWT_SCHEME
    }
  },
  pages: {
    admin: {
      filename: 'admin/index.html',
      entry: './client/admin/main.js'
    },
    main: {
      filename: 'index.html',
      entry: './client/main/index.js'
    }
  },
  configureWebpack: {
    optimization: {
      minimizer: [
        new ESBuildMinifyPlugin()
      ]
    }
  },
  chainWebpack(config) {
    config.resolve.alias.merge(aliases);
    config.resolve.extensions.merge(extensions);
    config.module
      .rule('js')
      .test('/.js$/')
      .use('esbuild-loader')
      .loader('esbuild-loader')
      .end();
  },
  devServer,
  transpileDependencies: [
    'vuetify'
  ]
};
