const { join, relative } = require('path');
const kebabCase = require('lodash/kebabCase');

module.exports = {
  helpers: {
    getResourcePath: (resource, path) => join('server', path || kebabCase(resource)),
    getBaseEntityPath: (from, to) => relative(from, to)
  }
};
