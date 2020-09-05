import { commentsBaseType, commentsQueryArgs, usersBaseType, usersQueryArgs } from './base-schema';
import { GraphQLSchema } from 'graphql';
import { initGiraphyApp } from '../app';
import { RelationQuery, TypeRootQuery } from '../schema/rdbms/rdbms-query';
import { createRootQuery, QueryObjectType } from '../schema/query-object-type';

const commentsType: QueryObjectType<any, any> = commentsBaseType.extend("Comments", {
  commentId: {
    permission: (source, context, args) => true
  },
  user: {
    relation: () => new RelationQuery(
      usersType,
      usersQueryArgs,
{ type: "hasOne", from: "user_id", to: "user_id" },
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
      commentsQueryArgs,
  { type: "hasMany", from: "user_id", to: "user_id" },
    )
  }
});

const rootQuery = createRootQuery({
  users: {
    root: new TypeRootQuery(usersType, usersQueryArgs),
    permission: (source, context, args) => true
  },
  comments: {
    root: new TypeRootQuery(commentsType, commentsQueryArgs)
  }
});

const schema = new GraphQLSchema({
  query: rootQuery
});

initGiraphyApp(schema);
