import { QueryObjectType } from './query-object-type';
import {
  GraphQLFieldConfig,
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldMap,
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType
} from 'graphql/type/definition';
import { escapeSqlString } from './rdbms/rdbms-util';

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

const rdbmsColumnFieldsToArgs = <TSource, TContext>(fieldMap: GraphQLFieldMap<TSource, TContext>): GraphQLFieldConfigArgumentMap => {
  let args = {} as GraphQLFieldConfigArgumentMap;
  Object.keys(fieldMap).map(key => {
    if ((fieldMap[key]! as any)["sqlColumn"]) {
      const fieldType = fieldMap[key].type

      if (fieldType instanceof GraphQLScalarType) {
        args[key] = (
          {
            type: fieldType
          }
        )
      }
    }
  });

  return args;
}

export class RelationQuery<TSource, TContext, TArgs> {
  public config: GraphQLFieldConfig<TSource, TContext, TArgs>

  constructor(
    type: QueryObjectType<TSource, TContext>,
    relationSetting: RelationSetting,
  ) {
    this.config = {
      type: relationSettingToGraphQLObjectType(type, relationSetting.type),
      sqlJoin: (fromTable: string, toTable: string) =>
        `${fromTable}.${relationSetting.from} = ${toTable}.${relationSetting.to}`,
      args: rdbmsColumnFieldsToArgs(type.objectType.getFields()),
      where: (table: string, args: TArgs, context: any) => {
        // @ts-ignore
        return Object.keys(args).map(key => `${table}.${type.objectType.getFields()[key].sqlColumn} = ${escapeSqlString(args[key])}`)
          .join(" and ");
      },
    }
  }
}
