import { commentsBaseType, commentsQueryArgs, usersBaseType, usersQueryArgs } from './base-schema';
import { GraphQLSchema } from 'graphql';
import { initGiraphyApp } from '../app';
import { RelationQuery, TypeRootQuery } from '../schema/rdbms/rdbms-query';
import { createRootQuery, QueryObjectType } from '../schema/query-object-type';

import { connectionDefinitions } from 'graphql-relay'

const commentsType: QueryObjectType<any, any> = commentsBaseType.extend("Comments", {
  commentId: {
    permission: (source, context, args) => true
  },
  user: {
    relation: () => new RelationQuery(
      usersType,
{ type: "hasOne", from: "user_id", to: "user_id" },
      {
        args: usersQueryArgs
      },
    )
  }
});

const usersType: QueryObjectType<any, any> = usersBaseType.extend("Users", {
  email: {
    permission: (source, context, args) => true
  },
  comments: {
    relation: () => new RelationQuery(
      commentsType,
  { type: "hasMany", from: "user_id", to: "user_id" },
      {
        args: commentsQueryArgs
      }
    )
  }
});

// @ts-ignore
const { connectionType: UserConnection } = connectionDefinitions({ nodeType: usersType.objectType });

const rootQuery = createRootQuery({
  users: {
    root: new TypeRootQuery(usersType, {
      args: usersQueryArgs,
      pagination: true
    }),
    permission: (source, context, args) => true
  },
  comments: {
    root: new TypeRootQuery(commentsType, {
      args: commentsQueryArgs,
      pagination: true
    })
  }
});

const schema = new GraphQLSchema({
  query: rootQuery
});

initGiraphyApp(schema);
