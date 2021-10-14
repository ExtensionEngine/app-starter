'use strict';

const db = require('./rds');
// const path = require('path');
// const s3 = require('./s3');

// const siteDir = path.join(__dirname, '../dist/client');
// s3.copyDirToBucket(siteDir, s3.siteBucket);

module.exports = {
  rdsAddress: db.address
  // siteBucketEndpoint: s3.siteBucket.websiteEndpoint
};
