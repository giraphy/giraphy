import { QueryObjectType } from '../query-object-type';
import {
  GraphQLFieldConfig,
  GraphQLFieldConfigArgumentMap,
  GraphQLList,
  GraphQLNonNull, GraphQLObjectType
} from 'graphql/type/definition';
import { escapeSqlString } from './rdbms-util';
import { executeQuery } from './rdbms-schema';
import { connectionDefinitions, forwardConnectionArgs } from 'graphql-relay'
import { GraphQLInt } from 'graphql';

export class RelationQuery<TSource, TContext, TArgs> {
  public config: GraphQLFieldConfig<TSource, TContext, TArgs>

  constructor(
    type: QueryObjectType<TSource, TContext>,
    relationSetting: RelationSetting,
    conf?: Partial<{
      args: GraphQLFieldConfigArgumentMap,
      pagination: boolean
    }>
  ) {
    // @ts-ignore
    const objectType: GraphQLObjectType =
      conf && conf.pagination ?
        connectionDefinitions({
          // @ts-ignore
          nodeType: relationSettingToGraphQLObjectType(type, relationSetting.type),
        }).connectionType :
        relationSettingToGraphQLObjectType(type, relationSetting.type);

    this.config = {
      type: objectType,
      sqlJoin: (fromTable: string, toTable: string) =>
        `${fromTable}.${relationSetting.from} = ${toTable}.${relationSetting.to}`,
      args: getArgsFromQueryConfig(conf),
      sqlPaginate: conf && conf.pagination ? conf.pagination : false,
      sortKey: conf && conf.pagination ? {
        key: type.toConfig().uniqueKey as string,
        order: 'ASC'
      } : undefined,
      where: (table: string, args: TArgs, context: any) => {
        // @ts-ignore
        return Object.keys(args).map(key => `${table}.${type.objectType.getFields()[key].sqlColumn} = ${escapeSqlString(args[key])}`)
          .join(" and ");
      },
    }
  }
}

export class TypeRootQuery<TSource, TContext, TArgs> {
  public config: GraphQLFieldConfig<TSource, TContext, TArgs>

  constructor(
    type: QueryObjectType<TSource, TContext>,
    conf?: Partial<{
      args: GraphQLFieldConfigArgumentMap,
      pagination: boolean
    }>,
  ) {
    // @ts-ignore
    const objectType: GraphQLObjectType =
      conf && conf.pagination ?
        connectionDefinitions({
          // @ts-ignore
          nodeType: type.objectType,
        }).connectionType :
        type.objectType;

    this.config = {
      type: objectType,
      resolve: (source, args, context, info) => executeQuery(info, context),
      args: getArgsFromQueryConfig(conf),
      sqlPaginate: conf && conf.pagination ? conf.pagination : false,
      sortKey: conf && conf.pagination ? {
        key: type.toConfig().uniqueKey as string,
        order: 'ASC'
      } : undefined,
      where: (table: string, args: TArgs, context: any) => {
        // @ts-ignore
        return Object.keys(args).map(key => {
          if (!(type.objectType.getFields()[key]) || !((type.objectType.getFields()[key] as any)["sqlColumn"]))
            return;

          const sqlColumn = (type.objectType.getFields()[key] as any)["sqlColumn"];
          return `${table}.${sqlColumn} = ${escapeSqlString((args as any)[key])}`
        }).filter(statment => !!statment)
          .join(" and ");
      },
    }
  }
}

type RelationType = "hasMany" | "hasOne" | "hasOptionalOne";

export type RelationSetting = {
  type: RelationType,
  from: string,
  to: string
}

const relationSettingToGraphQLObjectType = (objectType: QueryObjectType<any, any>, relationType: RelationType) => {
  switch (relationType) {
    case 'hasMany': return new GraphQLList(objectType.objectType)
    case 'hasOne': return objectType.objectType
    case 'hasOptionalOne': return new GraphQLNonNull(objectType.objectType)
  }
}

const getArgsFromQueryConfig = (conf?: Partial<{
  args: GraphQLFieldConfigArgumentMap,
  pagination: boolean
}>): GraphQLFieldConfigArgumentMap | undefined => {
  if (!conf) {
    return;
  }
  const { args, pagination } = conf;
  return pagination ? { ...forwardConnectionArgs, ...args } : args;
}
