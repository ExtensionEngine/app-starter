'use strict';

const { dbSecurityGroup, dbSubnetGroup } = require('../vpc');
const aws = require('@pulumi/aws');
const pulumi = require('@pulumi/pulumi');

const config = new pulumi.Config('db');

const db = new aws.rds.Instance('pulumi-test-postgres', {
  allocatedStorage: 20,
  dbSubnetGroupName: dbSubnetGroup.name,
  engine: 'postgres',
  engineVersion: '13.3',
  instanceClass: 'db.m6g.large',
  publiclyAccessible: true,
  skipFinalSnapshot: true,
  vpcSecurityGroupIds: [dbSecurityGroup.id],
  name: config.require('name'),
  username: config.require('user'),
  password: config.requireSecret('password')
});

module.exports = db;