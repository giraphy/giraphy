import { GraphQLObjectType, GraphQLString, } from "graphql";

export default new GraphQLObjectType({
  description: "global query object",
  name: "Query",
  fields: () => ({
    version: {
      type: GraphQLString,
      resolve: () => "0.1",
    },
  }),
});
