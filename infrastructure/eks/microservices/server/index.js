'use strict';

const hpa = require('./autoscaler');
const { NAME } = require('./deployment');
const service = require('./service');

module.exports = { NAME, service, hpa };
