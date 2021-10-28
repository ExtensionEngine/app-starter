'use strict';

const cluster = require('./cluster');
const k8s = require('@pulumi/kubernetes');

const ns = new k8s.core.v1.Namespace('app-starter-namespace', {
  metadata: { name: 'app-starter' }
}, { provider: cluster.provider });
const namespace = ns.metadata.name;

module.exports = namespace;
