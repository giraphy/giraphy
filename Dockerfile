# Server Build
FROM node:10.17.0 as build-stage
ADD ./ /app/
WORKDIR /app/graphql-server
RUN npm install
RUN node --optimize_for_size --gc_interval=100 ./node_modules/typescript/bin/tsc -p .

# Scripts Build
WORKDIR /app/scripts
RUN npm install
RUN node --optimize_for_size --gc_interval=100 ./node_modules/webpack/bin/webpack --mode production

# RUN
FROM node:10.17.0
COPY --from=build-stage /app/graphql-server/lib /app/graphql-server/lib
COPY --from=build-stage /app/graphql-server/node_modules /app/graphql-server/node_modules
COPY --from=build-stage /app/scripts/dist /app/scripts/dist
COPY --from=build-stage /app/scripts/node_modules /app/scripts/node_modules
COPY --from=build-stage /app/scripts/node_modules /app/scripts/node_modules
COPY --from=build-stage /app/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
WORKDIR /app/
EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]
