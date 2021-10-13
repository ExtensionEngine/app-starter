'use strict';

const aws = require('@pulumi/aws');
const mime = require('mime');
const path = require('path');
const pulumi = require('@pulumi/pulumi');
const readDirRecursive = require('fs-readdir-recursive');

const siteBucket = new aws.s3.Bucket('site-bucket', {
  website: { indexDocument: 'index.html' }
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

function copyDirToBucket(dir, bucket) {
  const files = readDirRecursive(dir);
  files.forEach(file => {
    const filePath = path.relative(process.cwd(), path.join(dir, file));
    const object = new aws.s3.BucketObject(file, {
      key: file,
      bucket,
      source: new pulumi.asset.FileAsset(filePath),
      contentType: mime.getType(filePath)
    });
  });
}

module.exports = { siteBucket, copyDirToBucket };
