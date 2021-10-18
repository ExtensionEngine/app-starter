'use strict';

const aws = require('@pulumi/aws');
const pulumi = require('@pulumi/pulumi');

const config = new pulumi.Config('s3');

const storageBucket = new aws.s3.Bucket('storage-bucket', {
  bucket: config.require('storage-bucket-name')
});

const siteBucket = new aws.s3.Bucket('site-bucket', {
  bucket: config.require('site-bucket-name'),
  website: {
    indexDocument: 'index.html',
    errorDocument: 'index.html'
  }
});

const siteBucketPolicy = new aws.s3.BucketPolicy('bucket-policy', {
  bucket: siteBucket.bucket,
  policy: siteBucket.bucket.apply(publicReadPolicyForBucket)
});

function publicReadPolicyForBucket(name) {
  return {
    Version: '2012-10-17',
    Statement: [{
      Effect: 'Allow',
      Principal: '*',
      Action: ['s3:GetObject'],
      Resource: [`arn:aws:s3:::${name}/*`]
    }]
  };
}

module.exports = { storageBucket, siteBucket };
