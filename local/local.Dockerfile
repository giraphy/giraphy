FROM giraphy-local-base

ADD ./ /app/
WORKDIR /app/graphql-server
RUN node --optimize_for_size --gc_interval=100 ./node_modules/typescript/bin/tsc -p .
WORKDIR /app/scripts
RUN node --optimize_for_size --gc_interval=100 ./node_modules/webpack/bin/webpack --mode production
RUN chmod +x /app/entrypoint.sh
WORKDIR /app/
EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]
