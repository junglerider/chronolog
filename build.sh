#!/bin/bash
# Execute production build and create a Docker image
npm run clean --prefix ./api
npm run build --prefix ./api
npm run build --prefix ./app
docker build -t chronolog .