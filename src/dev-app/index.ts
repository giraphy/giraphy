import { commentsBaseType, usersBaseType, usersRootQuery } from './base-schema';
import { GraphQLSchema } from 'graphql';
import { createRootQuery, } from '../schema/giraphy-schema';
import { initGiraphyApp } from '../app';
import { RelationQuery } from '../schema/relation-query';

const rootQuery = createRootQuery({
  users: {
    root: usersRootQuery(usersBaseType.extend("Users", {
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
