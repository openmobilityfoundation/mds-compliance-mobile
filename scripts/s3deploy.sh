#!/bin/bash

# NOTE: assumes we have `source`d `.env.production` or `.env.staging`
echo "Using S3 profile :  $CM_S3_PROFILE"
echo "Using S3 bucket  :  $CM_S3_BUCKET"

aws s3 rm --recursive --profile $CM_S3_PROFILE $CM_S3_BUCKET
aws s3 cp --recursive --profile $CM_S3_PROFILE build/ $CM_S3_BUCKET/ --cache-control no-cache --exclude "static/*"
aws s3 cp --recursive --profile $CM_S3_PROFILE build/ $CM_S3_BUCKET/ --cache-control max-age=31536000 --exclude "*" --include "static/*"
