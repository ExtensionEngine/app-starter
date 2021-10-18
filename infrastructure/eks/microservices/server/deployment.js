'use strict';

const cluster = require('../../cluster');
const db = require('../../../rds');
const k8s = require('@pulumi/kubernetes');
const namespace = require('../../namespace');
const pulumi = require('@pulumi/pulumi');
const s3 = require('../../../s3');

const serverConfig = new pulumi.Config('server');
const dbConfig = new pulumi.Config('db');

const NAME = 'server';

const deployment = new k8s.apps.v1.Deployment(`${NAME}-deployment`, {
  metadata: { name: NAME, namespace },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: { app: NAME }
    },
    template: {
      metadata: {
        labels: { app: NAME }
      },
      spec: {
        // TODO: Add liveness and readiness probes
        containers: [{
          image: serverConfig.require('docker-image'),
          name: NAME,
          resources: {
            requests: { cpu: '250m' }
          },
          env: [
            { name: 'DATABASE_HOST', value: db.address },
            { name: 'DATABASE_PORT', value: db.port.apply(port => String(port)) },
            { name: 'DATABASE_NAME', value: dbConfig.require('name') },
            { name: 'DATABASE_USER', value: dbConfig.require('user') },
            { name: 'DATABASE_PASSWORD', value: dbConfig.requireSecret('password') },
            { name: 'STORAGE_BUCKET', value: s3.storageBucket.bucket }
          ]
        }]
      }
    }
  }
}, { provider: cluster.provider });

module.exports = { NAME, deployment };
