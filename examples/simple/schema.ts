import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
} from "graphql";

import joinMonster from "join-monster";
import { dbCall } from "./rdbms-client";

const Posts: GraphQLObjectType = new GraphQLObjectType({
  name: "Posts",
  sqlTable: "posts",
  uniqueKey: "post_id",
  fields: () => ({
    post_id: {
      type: GraphQLString,
    },
    user_id: {
      type: GraphQLString,
    },
    body: {
      type: GraphQLString,
    },
  }),
});
const posts = {
  type: new GraphQLList(Posts),
  resolve: (parent, args, context, resolveInfo) =>
    joinMonster(resolveInfo, context, (sql: any) =>
      dbCall(sql, context)
    ),
  args: {
    post_id: { type: GraphQLString },
    user_id: { type: GraphQLString },
    body: { type: GraphQLString },
  },
  where: (postsTable, args, context) => {
    if (args.post_id) return `${postsTable}.post_id = ${args.post_id}`;
    if (args.user_id) return `${postsTable}.user_id = ${args.user_id}`;
    if (args.body) return `${postsTable}.body = ${args.body}`;
  },
};

const Users: GraphQLObjectType = new GraphQLObjectType({
  name: "Users",
  sqlTable: "users",
  uniqueKey: "user_id",
  fields: () => ({
    user_id: {
      type: GraphQLString,
    },
    email: {
      type: GraphQLString,
    },
  }),
});
const users = {
  type: new GraphQLList(Users),
  resolve: (parent, args, context, resolveInfo) =>
    joinMonster(resolveInfo, context, (sql: any) =>
      dbCall(sql, context)
    ),
  args: {
    user_id: { type: GraphQLString },
    email: { type: GraphQLString },
  },
  where: (usersTable, args, context) => {
    if (args.user_id) return `${usersTable}.user_id = ${args.user_id}`;
    if (args.email) return `${usersTable}.email = ${args.email}`;
  },
};

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    description: "global query object",
    name: "Query",
    fields: () => ({
      version: {
        type: GraphQLString,
        resolve: () => "0.1",
      },
      posts: posts,
      users: users,
    }),
  }),
});