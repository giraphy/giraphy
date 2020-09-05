import {
  GraphQLError,
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLResolveInfo
} from 'graphql';
import { RelationQuery, TypeRootQuery } from './rdbms/rdbms-query';

export class QueryObjectType<TSource, TContext> {
  objectType: GraphQLObjectType;

  constructor(config: GraphQLObjectTypeConfig<TSource, TContext>) {
    this.objectType = new GraphQLObjectType(config);
  }

  toConfig(): GraphQLObjectTypeConfig<TSource, TContext> {
    return (this.objectType as any)["_typeConfig"] as GraphQLObjectTypeConfig<TSource, TContext>
  }

  toFieldConfigs(): GraphQLFieldConfigMap<TSource, TContext> {
    const fieldConfigThunk = this.toConfig().fields
    if (Object.keys(fieldConfigThunk).length == 0) {
      return (fieldConfigThunk as () => GraphQLFieldConfigMap<TSource, TContext>)();
    } else {
      return fieldConfigThunk as GraphQLFieldConfigMap<TSource, TContext>;
    }
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

  private extendFieldWithPermission<TArgs>(extensionParams: ObjectTypeExtension<TSource, TContext>): QueryObjectType<TSource, TContext> {
    const fieldsF = () => {
      let currentFields: GraphQLFieldConfigMap<TSource, TContext> = this.toFieldConfigs();

      Object.keys(extensionParams).forEach(key => {
        if (this.objectType.getFields()[key]) {
          const currentField = currentFields[key];
          const resolve = currentField.resolve;

          currentField.resolve = ((source: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo) => {
            if (extensionParams[key] && extensionParams[key].permission && !extensionParams[key].permission!(source, context, args)) {
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

      return currentFields
    }

    return new QueryObjectType({
      ...this.toConfig(),
      fields: fieldsF
    });
  }

  private extendFieldWithRelation<TArgs>(extensionParams: ObjectTypeExtension<TSource, TContext>): QueryObjectType<TSource, TContext> {

    const fieldsF = () => {
      let fields: GraphQLFieldConfigMap<TSource, TContext> = this.toFieldConfigs();

      Object.keys(extensionParams).forEach(key => {
        const extensionParam = extensionParams[key];

        if (extensionParams && extensionParam.relation) {
          const relation = extensionParam.relation;
          fields[key] = relation().config
        }
      });
      return fields;
    }

    return new QueryObjectType({
      ...this.toConfig(),
      fields: fieldsF
    })
  }
}

type ObjectTypeExtension<TSource, TContext, TArgs = { [key: string]: any }> = Record<
  string, Partial<{
  permission: (source: TSource, context: TContext, args: TArgs) => boolean,
  relation: () => RelationQuery<any, any, any>
}>
  >

export const createRootQuery = (
  params: Record<string, {
    root: TypeRootQuery<any, any, any>,
    permission?: ((source: any, context: any, args: any) => boolean),
  }>
): GraphQLObjectType => {
  const fieldsF = () => {
    let fields: GraphQLFieldConfigMap<any, any> = {};
    Object.keys(params).forEach(key => {
      const param = params[key]!;
      fields[key] = param.root.config;
    });
    return fields;
  }

  return new QueryObjectType({
    name: "Query",
    fields: fieldsF
  }).extend("Query", params).objectType
};
