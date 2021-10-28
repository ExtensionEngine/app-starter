'use strict';

const cluster = require('./cluster');
const k8s = require('@pulumi/kubernetes');
const namespace = require('./namespace');
const service = require('./microservices/server/service');

const nginx = new k8s.helm.v3.Chart('nginx', {
  namespace,
  chart: 'nginx-ingress',
  version: '1.24.4',
  fetchOpts: { repo: 'https://charts.helm.sh/stable/' },
  values: {
    controller: {
      publishService: { enabled: true }
    }
  }
}, { providers: { kubernetes: cluster.provider } });

const ingress = new k8s.networking.v1.Ingress('nginx-ingress-rule', {
  metadata: {
    namespace,
    annotations: {
      'kubernetes.io/ingress.class': 'nginx'
    }
  },
  spec: {
    rules: [
      {
        // host: 'api.app-starter.com',
        http: {
          paths: [
            {
              path: '/',
              pathType: 'Prefix',
              backend: {
                service: {
                  name: service.metadata.name,
                  port: { number: 3000 }
                }
              }
            }
          ]
        }
      }
    ]
  }
}, { provider: cluster.provider });

module.exports = ingress;
