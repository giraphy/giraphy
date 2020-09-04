import { commentsBaseType, commentsRelationQuery, usersBaseType, usersRootQuery } from './base-schema';
import { GraphQLSchema } from 'graphql';
import { createRootQuery, } from '../schema/giraphy-schema';
import { initGiraphyApp } from '../app';

const rootQuery = createRootQuery({
  users: {
    root: usersRootQuery(usersBaseType.extend({
      email: {
        permission: (source, context, args) => false
      },
      // TODO リレーションのアプデ
      comments: {
        relation: commentsRelationQuery(commentsBaseType.extend({
          commentId: {
            permission: (source, context, args) => true
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
