# Deploy
FROM node:10.17.0 as build-stage

ADD ./ /app/
WORKDIR /app/graphql-server
RUN npm install
RUN node --optimize_for_size --gc_interval=100 ./node_modules/typescript/bin/tsc -p .

EXPOSE 3000
CMD [ "node", "./lib/index.js" ]
