const kebabCase = require('lodash/kebabCase');
const { relative } = require('path');

module.exports = {
  helpers: {
    getResourcePath: (resource, path) => `server/${path || kebabCase(resource)}`,
    getBaseEntityPath: (from, to) => relative(from, to)
  }
};
