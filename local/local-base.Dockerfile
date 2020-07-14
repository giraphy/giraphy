# Server Build
FROM node:10.17.0
ADD ./graphql-server/package.json /app/graphql-server/package.json
WORKDIR /app/graphql-server
RUN npm install

# Scripts Build
ADD ./scripts/package.json /app/scripts/package.json
WORKDIR /app/scripts
RUN npm install
