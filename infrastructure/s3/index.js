'use strict';

const aws = require('@pulumi/aws');

const siteBucket = new aws.s3.Bucket('site-bucket', {
  bucket: 'app-starter-site-bucket',
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

module.exports = { siteBucket };
