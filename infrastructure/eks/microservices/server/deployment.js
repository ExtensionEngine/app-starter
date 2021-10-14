'use strict';

const cluster = require('../../cluster');
const k8s = require('@pulumi/kubernetes');
const namespace = require('../../namespace');
const pulumi = require('@pulumi/pulumi');

const config = new pulumi.Config('server');

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
          image: config.get('docker-image'),
          name: NAME,
          resources: {
            requests: {
              cpu: '100m'
            }
          }
        }]
      }
    }
  }
}, { provider: cluster.provider });

module.exports = { NAME, deployment };
