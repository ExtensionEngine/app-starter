'use strict';

const aws = require('@pulumi/aws');
const awsx = require('@pulumi/awsx');

const vpc = new awsx.ec2.Vpc('vpc', { numberOfAvailabilityZones: 2 });

const dbSecurityGroup = new aws.ec2.SecurityGroup('db-security-group', {
  vpcId: vpc.id,
  ingress: [
    // Allow ingress traffic from EE's VPN IP.
    { protocol: 'tcp', fromPort: 5432, toPort: 5432, cidrBlocks: ['95.168.101.126/32'] }
  ]
});

const dbSubnetGroup = new aws.rds.SubnetGroup('db-subnet-group', {
  subnetIds: vpc.publicSubnetIds
});

module.exports = { vpc, dbSecurityGroup, dbSubnetGroup };
