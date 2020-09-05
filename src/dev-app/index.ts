import { commentsBaseType, usersBaseType } from './base-schema';
import { GraphQLSchema } from 'graphql';
import { initGiraphyApp } from '../app';
import { RelationQuery, TypeRootQuery } from '../schema/rdbms/rdbms-query';
import { createRootQuery } from '../schema/query-object-type';

const rootQuery = createRootQuery({
  users: {
    root: new TypeRootQuery(usersBaseType.extend("Users", {
      email: {
        permission: (source, context, args) => false
      },
      comments: {
        relation: new RelationQuery(
          commentsBaseType.extend("Comments", {
            commentId: {
              permission: (source, context, args) => true
            },
            user: {
              relation: new RelationQuery(
                usersBaseType,
                { type: "hasOne", from: "user_id", to: "user_id" }
              )
            }
          }),
          { type: "hasMany", from: "user_id", to: "user_id" }
        )
      }
    })),
    permission: (source, context, args) => true
  }
});

const schema = new GraphQLSchema({
  query: rootQuery
});

initGiraphyApp(schema);
