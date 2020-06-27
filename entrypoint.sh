#!/bin/bash
set -e

cd /app/graphql-server/lib/conf
node /app/scripts/dist/main.js
mv /app/graphql-server/lib/conf/schema.js /app/graphql-server/lib/schema
node /app/graphql-server/lib/index.js
