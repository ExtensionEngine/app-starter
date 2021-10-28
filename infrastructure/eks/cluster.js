'use strict';

const eks = require('@pulumi/eks');
const { vpc } = require('../vpc');

const cluster = new eks.Cluster('app-starter-cluster', {
  vpcId: vpc.id,
  subnetIds: vpc.publicSubnetIds,
  desiredCapacity: 1
});

module.exports = cluster;
