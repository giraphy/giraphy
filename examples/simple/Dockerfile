FROM giraphy

ADD ./ /app/
WORKDIR /app/
RUN node ./scripts/dist/main.js
RUN mv /app/schema.js /app/graphql-server/
