'use strict';

function validateConfig(config, schema) {
  return schema.validate(config, { stripUnknown: true }, err => {
    if (err) throw new Error('Unsupported config structure');
  });
}

module.exports = {
  validateConfig
};
