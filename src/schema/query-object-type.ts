import {
  GraphQLError,
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLResolveInfo
} from 'graphql';
import { GraphQLFieldConfig } from 'graphql/type/definition';
import { RelationQuery, TypeRootQuery } from './rdbms/rdbms-query';

type ObjectTypeExtension<TSource, TContext, TArgs = { [key: string]: any }> = Record<
  string, Partial<{
  permission: (source: TSource, context: TContext, args: TArgs) => boolean,
  relation: RelationQuery<any, any, any>,
  custom: GraphQLFieldConfig<TSource, TContext, TArgs>
}>
>

export class QueryObjectType<TSource, TContext> {
  objectType: GraphQLObjectType;

  constructor(config: GraphQLObjectTypeConfig<TSource, TContext>) {
    this.objectType = new GraphQLObjectType(config);
  }

  toConfig(): GraphQLObjectTypeConfig<TSource, TContext> {
    return (this.objectType as any)["_typeConfig"] as GraphQLObjectTypeConfig<TSource, TContext>
  }

  extend<TArgs>(name: string, extensionParam: ObjectTypeExtension<TSource, TContext>): QueryObjectType<TSource, TContext> {
    return this
      .extendName(name)
      .extendFieldWithPermission(extensionParam)
      .extendFieldWithRelation(extensionParam)
  }

  private extendName(name: string): QueryObjectType<TSource, TContext> {
    return new QueryObjectType({
      ...this.toConfig(),
      name: name
    });
  }

  private extendFieldWithPermission<TArgs>(extensionParam: ObjectTypeExtension<TSource, TContext>): QueryObjectType<TSource, TContext> {
    let currentFields: GraphQLFieldConfigMap<TSource, TContext> = (this.toConfig().fields as () => GraphQLFieldConfigMap<TSource, TContext>)();

    Object.keys(extensionParam).forEach(key => {
      if (this.objectType.getFields()[key]) {
        const currentField = currentFields[key];
        const resolve = currentField.resolve;

        currentField.resolve = ((source: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo) => {
          if (extensionParam[key] && extensionParam[key].permission && !extensionParam[key].permission!(source, context, args)) {
            throw new GraphQLError("Forbiden Error");
          }
          if (resolve) {
            return resolve(source, args, context, info);
          } else {
            return (source as any) ? (source as any)[key] : undefined;
          }
        }) as GraphQLFieldResolver<TSource, TContext, Record<string, any>>
      }
    });

    return new QueryObjectType({
      ...this.toConfig(),
      fields: () => currentFields
    });
  }

  private extendFieldWithRelation<TArgs>(extensionParams: ObjectTypeExtension<TSource, TContext>): QueryObjectType<TSource, TContext> {
    let fields: GraphQLFieldConfigMap<TSource, TContext> = (this.toConfig().fields as () => GraphQLFieldConfigMap<TSource, TContext>)();

    Object.keys(extensionParams).forEach(key => {
      const extensionParam = extensionParams[key];

      if (extensionParams && extensionParam.relation) {
        const relation = extensionParam.relation;
        fields[key] = relation.config
      }
    });

    return new QueryObjectType({
      ...this.toConfig(),
      fields: () => fields
    })
  }

}

export const createRootQuery = (
  params: Record<string, {
    root: TypeRootQuery<any, any, any>,
    permission: ((source: any, context: any, args: any) => boolean) | undefined,
  }>
): GraphQLObjectType => {
  let fields: GraphQLFieldConfigMap<any, any> = {};
  Object.keys(params).forEach(key => {
    const param = params[key]!;
    fields[key] = param.root.config;
  });

  return new QueryObjectType({
      name: "Query",
      fields: () => fields
  }).extend("Query", params).objectType
};
