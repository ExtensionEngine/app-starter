'use strict';

const { deployment, NAME } = require('./deployment');
const cluster = require('../../cluster');
const k8s = require('@pulumi/kubernetes');
const namespace = require('../../namespace');

const hpa = new k8s.autoscaling.v1.HorizontalPodAutoscaler(`${NAME}-autoscaler`, {
  metadata: { namespace },
  spec: {
    minReplicas: 1,
    maxReplicas: 3,
    targetCPUUtilizationPercentage: 70,
    scaleTargetRef: {
      kind: 'Deployment',
      name: deployment.metadata.name,
      apiVersion: 'apps/v1'
    }
  }
}, { provider: cluster.provider });

module.exports = hpa;
