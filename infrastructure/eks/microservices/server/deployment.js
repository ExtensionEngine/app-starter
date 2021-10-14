'use strict';

const cluster = require('../../cluster');
const k8s = require('@pulumi/kubernetes');
const namespace = require('../../namespace');

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
        containers: [{
          image: 'ikovac01/kubernetes-hello',
          name: NAME
        }]
      }
    }
  }
}, { provider: cluster.provider });

module.exports = { NAME, deployment };
