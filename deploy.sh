#!/bin/bash

. .env

rm -rf dist/
npm run build

rsync -avz --progress --delete dist/ $PROD_HOST:$DEPLOY_DIR

