#!/bin/bash

# Create and use a new builder instance that supports multi-platform builds
docker buildx create --name dify-builder --use

# # Build the web image
# docker build -t 907053915986.dkr.ecr.ap-southeast-1.amazonaws.com/dify:web-latest ./web

# # Build the api image
# docker build -t 907053915986.dkr.ecr.ap-southeast-1.amazonaws.com/dify:api-latest ./api

aws ecr get-login-password --region ap-southeast-1 --profile kova | docker login --username AWS --password-stdin 907053915986.dkr.ecr.ap-southeast-1.amazonaws.com

# # Push the images to the ECR repository
# docker push 907053915986.dkr.ecr.ap-southeast-1.amazonaws.com/dify:web-latest
# docker push 907053915986.dkr.ecr.ap-southeast-1.amazonaws.com/dify:api-latest

docker buildx build --platform linux/amd64,linux/arm64 -t 907053915986.dkr.ecr.ap-southeast-1.amazonaws.com/dify:api-009 --push ./api

docker buildx build --platform linux/amd64,linux/arm64 -t 907053915986.dkr.ecr.ap-southeast-1.amazonaws.com/dify:web-009 --push ./web
