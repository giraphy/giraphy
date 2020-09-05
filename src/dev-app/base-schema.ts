import { GraphQLString } from 'graphql';
import { QueryObjectType } from '../schema/query-object-type';

export const usersBaseType: QueryObjectType<any, any> = new QueryObjectType({
  name: "UsersBase",
  // @ts-ignore
  sqlTable: "users",
  uniqueKey: "user_id",
  fields: {
    userId: {
      type: GraphQLString,
      sqlColumn: "user_id",
    },
    email: {
      type: GraphQLString,
      sqlColumn: "email",
    },
  },
});

export const usersQueryArgs = {
  userId: {
    type: GraphQLString
  },
  email: {
    type: GraphQLString
  }
}

export const commentsBaseType: QueryObjectType<any, any> = new QueryObjectType({
  name: "CommentsBase",
  // @ts-ignore
  sqlTable: "comments",
  uniqueKey: "comment_id",
  fields: {
    commentId: {
      type: GraphQLString,
      sqlColumn: "comment_id",
    },
    userId: {
      type: GraphQLString,
      sqlColumn: "user_id",
    },
    text: {
      type: GraphQLString,
      sqlColumn: "text",
    },
  },
});

export const commentsQueryArgs = {
  commentId: {
    type: GraphQLString,
  },
  userId: {
    type: GraphQLString,
  },
  text: {
    type: GraphQLString,
  },
}
