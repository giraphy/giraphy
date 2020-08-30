import { usersRootQuery } from './base-schema';
import { GraphQLSchema } from 'graphql';
import { GiraphyObjectType } from '../schema/giraphy-schema';
import { initGiraphyApp } from '../app';

export let rootQueryObject = new GiraphyObjectType({
  name: "Query",
  fields: () => ({
    users: usersRootQuery,
  }),
});

const schema = new GraphQLSchema({
  query: rootQueryObject.objectType,
});

initGiraphyApp(schema);
