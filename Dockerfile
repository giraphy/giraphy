# Build
FROM node:10.17.0 as build-stage
ADD ./ /app/
WORKDIR /app/graphql-server
RUN npm install
RUN node --optimize_for_size --gc_interval=100 ./node_modules/typescript/bin/tsc -p .

# RUN
FROM node:10.17.0
COPY --from=build-stage /app/graphql-server/lib /app/graphql-server/lib
COPY --from=build-stage /app/graphql-server/node_modules /app/graphql-server/node_modules
WORKDIR /app/graphql-server
EXPOSE 3000
CMD [ "node", "./lib/index.js" ]
