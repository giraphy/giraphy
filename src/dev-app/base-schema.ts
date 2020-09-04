import { GraphQLFieldConfig, GraphQLList, GraphQLResolveInfo, GraphQLString } from 'graphql';
import {
  RelationQuery,
  RelationType,
  RootQuery
} from '../schema/giraphy-schema';
import { executeQuery } from '../schema/rdbms/rdbms-schema';
import { escapeSqlString } from '../schema/rdbms/rdbms-util';
import { QueryObjectType } from '../schema/query-object-type';

export const usersBaseType: QueryObjectType<any, any> = new QueryObjectType({
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
  }),
});

export const usersRootQuery = <TSource, TContext, TArgs>(objectType: QueryObjectType<TSource, TContext>): RootQuery<TSource, TContext, TArgs> => new RootQuery({
  type: new GraphQLList(objectType.objectType),
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

export const usersRelationQuery = <TSource, TContext, TArgs>(objectType: QueryObjectType<TSource, TContext>, relation: RelationType): RelationQuery<TSource, TContext, TArgs> => new RelationQuery({
    type: objectType.objectType,
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
})

export const commentsBaseType: QueryObjectType<any, any> = new QueryObjectType({
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
  }),
});

export const commentsRootQuery = <TSource, TContext, TArgs>(objectType: QueryObjectType<TSource, TContext>): GraphQLFieldConfig<TSource, TArgs> => ({
  type: new GraphQLList(objectType.objectType),
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
});

export const commentsRelationQuery = <TSource, TContext, TArgs>(objectType: QueryObjectType<TSource, TContext>, relation: RelationType): RelationQuery<TSource, TContext, TArgs> =>
  new RelationQuery({
    type: new GraphQLList(objectType.objectType),
    sqlJoin: (fromTable: string, toTable: string) =>
      `${fromTable}.${relation.from}} = ${toTable}${relation.to}`,
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
