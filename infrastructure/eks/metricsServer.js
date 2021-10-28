'use strict';

const cluster = require('./cluster');
const k8s = require('@pulumi/kubernetes');

const metricsServer = new k8s.helm.v3.Chart('metrics-server', {
  chart: 'metrics-server',
  fetchOpts: { repo: 'https://kubernetes-sigs.github.io/metrics-server/' },
  version: '3.5.0'
}, { providers: { kubernetes: cluster.provider } });

module.exports = metricsServer;
