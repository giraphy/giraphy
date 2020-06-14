import { GraphQLSchema } from "graphql";

import QueryRoot from "./query-root";

export const schema = new GraphQLSchema({
  query: QueryRoot,
});
