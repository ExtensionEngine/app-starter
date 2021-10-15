'use strict';

const cluster = require('../../cluster');
const db = require('../../../rds');
const k8s = require('@pulumi/kubernetes');
const namespace = require('../../namespace');
const pulumi = require('@pulumi/pulumi');

const serverConfig = new pulumi.Config('server');
const dbConfig = new pulumi.Config('database');

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
          image: serverConfig.get('docker-image'),
          name: NAME,
          resources: {
            requests: {
              cpu: '250m'
            }
          },
          env: [
            { name: 'DATABASE_HOST', value: db.address },
            { name: 'DATABASE_PORT', value: db.port },
            { name: 'DATABASE_NAME', value: dbConfig.get('name') },
            { name: 'DATABASE_USER', value: dbConfig.get('user') },
            { name: 'DATABASE_PASSWORD', value: dbConfig.getSecret('password') }
          ]
        }]
      }
    }
  }
}, { provider: cluster.provider });

module.exports = { NAME, deployment };
