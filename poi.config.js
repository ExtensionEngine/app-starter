'use strict';

const path = require('path');

require('dotenv').config();

const { AUTH_JWT_SCHEME, SERVER_URL } = process.env;

const isProduction = process.env.NODE_ENV === 'production';

const aliases = {
  '@': path.resolve(__dirname, './client')
};

/** @type {import('poi').Config.DevServer} */
const devServer = {
  headers: {
    'X-Powered-By': 'Webpack DevSever'
  },
  proxy: {
    '/api': { target: SERVER_URL }
  },
  // Override using: `npm run dev:client -- --port <number>`
  port: 8081,
  hot: true,
  hotEntries: ['admin', 'main']
};

const extensions = ['.vue'];

/** @type {import('poi').Config.Plugins} */
const plugins = [
  '@poi/eslint',
  '@poi/bundle-report',
  require.resolve('./build/plugins/stats'),
  {
    resolve: require.resolve('./build/plugins/output-filenames'),
    options: {
      vendor: {
        font: 'assets/fonts/[name].[ext]',
        image: 'assets/images/[name].[ext]'
      }
    }
  }, {
    resolve: require.resolve('./build/plugins/clean-out-dir'),
    options: {
      cleanOnceBeforeBuildPatterns: ['**/*', '!.gitkeep']
    }
  },
  require.resolve('./build/plugins/html-version-spec')
];

/** @type {import('poi').Config} */
module.exports = {
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
  output: {
    dir: 'dist/client',
    sourceMap: !isProduction
  },
  plugins,
  chainWebpack(config) {
    config.resolve.alias.merge(aliases);
    config.resolve.extensions.merge(extensions);
  },
  envs: {
    API_PATH: '/api',
    AUTH_JWT_SCHEME
  },
  devServer
};
