#!/bin/bash
set -e

cd /app/graphql-server/lib/conf
node /app/scripts/dist/main.js
mv /app/graphql-server/lib/conf/schema.js /app/graphql-server/lib/schema
cp /app/graphql-server/lib/conf/giraphy.yaml /app/graphql-server
node /app/graphql-server/lib/index.js
