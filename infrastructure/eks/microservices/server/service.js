'use strict';

const cluster = require('../../cluster');
const k8s = require('@pulumi/kubernetes');
const { NAME } = require('./deployment');
const namespace = require('../../namespace');

const service = new k8s.core.v1.Service(`${NAME}-service`, {
  metadata: {
    name: `${NAME}-service`,
    namespace
  },
  spec: {
    type: 'LoadBalancer',
    ports: [{ port: 3000, targetPort: 3000 }],
    selector: { app: NAME }
  }
}, { provider: cluster.provider });

module.exports = service;
