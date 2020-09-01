import {
  GraphQLFieldConfig,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLSchema,
  GraphQLString
} from 'graphql';
import {
  createRootQuery,
  GiraphyObjectType,
  RelationQuery,
  RelationType,
  RichGraphqlObjectRootType,
  RichGraphqlObjectType, RootQuery
} from '../schema/giraphy-schema';
import { executeQuery } from '../schema/rdbms/rdbms-schema';
import { escapeSqlString } from '../schema/rdbms/rdbms-util';
import { GraphQLObjectTypeConfig } from 'graphql/type/definition';
import { rootQueryObject } from './index';



export const comments: GiraphyObjectType<any, any, any> = new GiraphyObjectType({
  name: "Comments",
  // @ts-ignore
  sqlTable: "comments",
  uniqueKey: "comment_id",
  fields: () => ({
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
    usersOne: {
      type: users.objectType,
      sqlJoin: (commentsTable: string, usersTable: string) =>
        `${commentsTable}.user_id = ${usersTable}.user_id`,
      args: {
        userId: { type: GraphQLString },
        email: { type: GraphQLString },
      },
      where: (table: string, args: any, context: any) => {
        // @ts-ignore
        return Object.keys(args).map(key => `${table}.${users.fieldConfig[key].sqlColumn} = ${escapeSqlString(args[key])}`)
          .join(" and ");
      },
    },
  }),
});

export const commentsRootQuery: GraphQLFieldConfig<any, any> = {
  type: (new GraphQLList(comments.objectType)).ofType,
  resolve: (source, args, context, info) => {
    return executeQuery(info, context)
  },
  args: {
    commentId: { type: GraphQLString },
    userId: { type: GraphQLString },
    text: { type: GraphQLString },
  },
  // @ts-ignore
  where: (table: string, args: any, context: any) => {
    // @ts-ignore
    return Object.keys(args).map(key => `${table}.${comments.fieldConfig[key].sqlColumn} = ${escapeSqlString(args[key])}`)
      .join(" and ");
  },
};

export const users: GiraphyObjectType<any, any, any> = new GiraphyObjectType({
  name: "Users",
  // @ts-ignore
  sqlTable: "users",
  uniqueKey: "user_id",
  fields: () => ({
    userId: {
      type: GraphQLString,
      sqlColumn: "user_id",
    },
    email: {
      type: GraphQLString,
      sqlColumn: "email",
    },
    commentsList: {
      type: new GraphQLList(comments.objectType),
      sqlJoin: (usersTable: string, commentsTable: string) =>
        `${usersTable}.user_id = ${commentsTable}.user_id`,
      args: {
        commentId: { type: GraphQLString },
        userId: { type: GraphQLString },
        text: { type: GraphQLString },
      },
      where: (table: string, args: any, context: any) => {
        // @ts-ignore
        return Object.keys(args).map(key => `${table}.${comments.fieldConfig[key].sqlColumn} = ${escapeSqlString(args[key])}`)
          .join(" and ");
      },
    },
  }),
});

export const usersRootQuery: GraphQLFieldConfig<any, any> = {
  type: new GraphQLList(users.objectType),
  resolve: (source, args, context, info) => {
    return executeQuery(info, context)
  },
  args: {
    userId: { type: GraphQLString },
    email: { type: GraphQLString },
  },
  // @ts-ignore
  where: (table: string, args: any, context: any) => {
    // @ts-ignore
    return Object.keys(args).map(key => `${table}.${users.fieldConfig[key].sqlColumn} = ${escapeSqlString(args[key])}`)
      .join(" and ");
  },
};

const commentBaseType = new RichGraphqlObjectType(comments.objectTypeConfig)
const usersBaseType = new RichGraphqlObjectType(users.objectTypeConfig)
const usersToCommentsListRelation: RelationType = {
    from: "user_id",
    to: "user_id"
};

const commentsRelationQuery = <TSource, TContext, TArgs>(objectType: RichGraphqlObjectType<TSource, TContext, TArgs>, relation: {type: string, from: string, to: string }): RelationQuery<TSource, TContext, TArgs> =>
  new RelationQuery({
    type: new GraphQLList(comments.objectType),
    sqlJoin: (usersTable: string, commentsTable: string) =>
      `${usersTable}.user_id = ${commentsTable}.user_id`,
    args: {
      commentId: { type: GraphQLString },
      userId: { type: GraphQLString },
      text: { type: GraphQLString },
    },
    where: (table: string, args: any, context: any) => {
      // @ts-ignore
      return Object.keys(args).map(key => `${table}.${comments.fieldConfig[key].sqlColumn} = ${escapeSqlString(args[key])}`)
        .join(" and ");
    },
  });

const usersType = usersBaseType
  .update({
    fullName: {
      permission: (source, context, args) => true,
    },
    comments: {
      relation: commentsRelationQuery(commentBaseType, {
        type: "hasMany",
        from: "user_id",
        to: "user_id",
      }),
      permission: (source, context, args) => true,
    }
  });

const usersRootQuery2 = <TSource, TContext, TArgs>(objectType: RichGraphqlObjectType<TSource, TContext, TArgs>): RootQuery<TSource, TContext, TArgs> => new RootQuery({
  type: new GraphQLList(objectType),
  resolve: (source: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo) => {
    return executeQuery(info, context)
  },
  args: {
    userId: { type: GraphQLString },
    email: { type: GraphQLString },
  },
  // @ts-ignore
  where: (table: string, args: any, context: any) => {
    // @ts-ignore
    return Object.keys(args).map(key => `${table}.${users.fieldConfig[key].sqlColumn} = ${escapeSqlString(args[key])}`)
      .join(" and ");
  },
});

const rootQuery = createRootQuery({
  users: {
    root: usersRootQuery2(usersType),
    permission: (source, context, args) => true
  }
})

const schema = new GraphQLSchema({
  query: rootQuery
});
