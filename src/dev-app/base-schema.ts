import { GraphQLFieldConfig, GraphQLList, GraphQLResolveInfo, GraphQLString } from 'graphql';
import { RootQuery } from '../schema/giraphy-schema';
import { executeQuery } from '../schema/rdbms/rdbms-schema';
import { escapeSqlString } from '../schema/rdbms/rdbms-util';
import { QueryObjectType } from '../schema/query-object-type';

export const usersBaseType: QueryObjectType<any, any> = new QueryObjectType({
  name: "UsersBase",
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

export const commentsBaseType: QueryObjectType<any, any> = new QueryObjectType({
  name: "CommentsBase",
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
