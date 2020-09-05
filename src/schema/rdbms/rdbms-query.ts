import { QueryObjectType } from '../query-object-type';
import {
  GraphQLFieldConfig,
  GraphQLFieldConfigArgumentMap,
  GraphQLList,
  GraphQLNonNull
} from 'graphql/type/definition';
import { escapeSqlString } from './rdbms-util';
import { executeQuery } from './rdbms-schema';

export class RelationQuery<TSource, TContext, TArgs> {
  public config: GraphQLFieldConfig<TSource, TContext, TArgs>

  constructor(
    type: QueryObjectType<TSource, TContext>,
    args: GraphQLFieldConfigArgumentMap,
    relationSetting: RelationSetting,
  ) {
    this.config = {
      type: relationSettingToGraphQLObjectType(type, relationSetting.type),
      sqlJoin: (fromTable: string, toTable: string) =>
        `${fromTable}.${relationSetting.from} = ${toTable}.${relationSetting.to}`,
      args: args,
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
    args: GraphQLFieldConfigArgumentMap
  ) {
    this.config = {
      type: type.objectType,
      resolve: (source, args, context, info) => executeQuery(info, context),
      args: args,
      where: (table: string, args: TArgs, context: any) => {
        // @ts-ignore
        return Object.keys(args).map(key => `${table}.${type.objectType.getFields()[key].sqlColumn} = ${escapeSqlString(args[key])}`)
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
