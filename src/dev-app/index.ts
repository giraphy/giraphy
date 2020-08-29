import * as queryExtend from './schema';
import { usersRootQuery } from './base-schema';
import { GraphQLSchema } from 'graphql';
import { GiraphyObjectType } from '../schema/giraphy-schema';
import { initGiraphyApp } from '../app';

export const rootQueryObject = new GiraphyObjectType({
  name: "Query",
  fields: () => ({
    users: usersRootQuery,
  }),
});

queryExtend.default();

const schema = new GraphQLSchema({
  query: rootQueryObject.objectType,
});

initGiraphyApp(schema);
