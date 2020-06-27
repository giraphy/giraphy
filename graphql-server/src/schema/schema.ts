import { GraphQLObjectType, GraphQLSchema, GraphQLString, } from "graphql";

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    description: "global query object",
    name: "Query",
    fields: () => ({
      version: {
        type: GraphQLString,
        resolve: () => "0.1",
      },
    }),
  }),
});
