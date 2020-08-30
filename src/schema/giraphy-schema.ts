import {
  GraphQLError,
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  GraphQLObjectType,
  GraphQLObjectTypeConfig, GraphQLResolveInfo,
} from 'graphql';

type ObjectTypeExtension<TSource, TContext, TArgs = { [key: string]: any }> = Record<
  string, {
    permission: (source: TSource, context: TContext, args: TArgs) => boolean
  }
>

export class GiraphyObjectType<TSource, TContext, TArgs = { [key: string]: any }> {
  objectType: GraphQLObjectType;
  objectTypeConfig: GraphQLObjectTypeConfig<TSource, TContext>;

  constructor(config: GraphQLObjectTypeConfig<TSource, TContext>) {
    this.objectType = new GraphQLObjectType((config));
    this.objectTypeConfig = config;
  }

  get fieldConfig(): GraphQLFieldConfigMap<TSource, TContext> {
    return (this.objectTypeConfig.fields as () => GraphQLFieldConfigMap<TSource, TContext>)();
  }

  extend(extensionParam: ObjectTypeExtension<TSource, TContext, TArgs>) {
    const currentFields: GraphQLFieldConfigMap<TSource, TContext> = (this.objectTypeConfig.fields as () => GraphQLFieldConfigMap<TSource, TContext>)();
    let newFields: GraphQLFieldConfigMap<TSource, TContext> = {};

    Object.keys(extensionParam).forEach(key => {
      if (this.objectType.getFields()[key]) {
        const resolve = currentFields[key].resolve;
        newFields[key] = {
          ...currentFields[key],
          resolve: (source: any, args: any, context: any, info: any) => {}
        };
        newFields[key].resolve = ((source: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo) => {
          if (extensionParam[key] && extensionParam[key].permission && !extensionParam[key].permission(source, context, args)) {
            throw new GraphQLError("Forbiden Error");
          }
          if (resolve) {
            return resolve(source, args, context, info);
          }
        }) as GraphQLFieldResolver<TSource, TContext, Record<string, any>>
      }
    });

    this.objectType = new GraphQLObjectType({
      ...this.objectTypeConfig,
      fields: () => ({
        ...(this.objectTypeConfig.fields as () => GraphQLFieldConfigMap<TSource, TContext>)(),
        ...newFields
      })
    })
  }
}
