import {
  GraphQLError,
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLResolveInfo,
} from 'graphql';
import { GraphQLFieldConfig } from 'graphql/type/definition';

export type RelationType = {
  from: string,
  to: string
}

type ObjectTypeExtension<TSource, TContext, TArgs = { [key: string]: any }> = Record<
  string, Partial<{
    permission: (source: TSource, context: TContext, args: TArgs) => boolean,
    relation: RelationQuery<any, any, any>,
    custom: GraphQLFieldConfig<TSource, TContext, TArgs>
  }>
>

type RootObjectTypeExtension<TSource, TContext, TArgs = { [key: string]: any }> = Record<
  string, Partial<{
    root: RootQuery<any, any, any>,
    permission: (source: TSource, context: TContext, args: TArgs) => boolean,
  }>
>


// type FieldConfigExtension<TSource, TContext, TArgs = { [argName: string]: any }> = {
//   type: RichGraphqlObjectType<TSource, TContext, TArgs> | {
//     fields: ObjectTypeExtension<TSource, TContext, TArgs>
//   },
// }

// export class RichGraphQLField<TSource, TContext, TArgs = { [argName: string]: any }> {
//
//
//   constructor(private config: GraphQLFieldConfig<TSource, TContext, TArgs>) {
//   }
//
//   toRootQuery(): RichGraphQLRootField<TSource, TContext, TArgs> {
//     return new RichGraphQLRootField(this.config);
//   }
//
//   update(extensionParam: FieldConfigExtension<TSource, TContext, TArgs>): RichGraphQLField<TSource, TContext, TArgs> {
//
//
//   }
// }
//
// export class RichGraphQLRelationField<TSource, TContext, TArgs = { [argName: string]: any }> extends RichGraphQLField<TSource, TContext, TArgs> {
//
//
// }

export class RelationQuery<TSource, TContext, TArgs> {
  constructor(private config: GraphQLFieldConfig<TSource, TContext, TArgs>) {}
}

export class RootQuery<TSource, TContext, TArgs> {
  constructor(public config: GraphQLFieldConfig<TSource, TContext, TArgs>) {}
}

export const createRootQuery = <TSource, TContext, TArgs>(
  param: Record<string, {
    root: RootQuery<any, any, any>,
    permission: ((source: any, context: any, args: any) => boolean) | undefined,
  }>
): GraphQLObjectType => {
  return new GraphQLObjectType({
    name: "Query",
    fields: () => {
      let fields: GraphQLFieldConfigMap<any, any> = {};
      Object.keys(param).map(key => {
        const rootConfig = param[key]!

        fields[key] = rootConfig.root.config;
        const resolve = fields[key].resolve
        fields[key].resolve = ((source: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo) => {
          if (param[key] && param[key].permission && !param[key].permission!(source, context, args)) {
            throw new GraphQLError("Forbiden Error");
          }
          if (resolve) {
            return resolve(source, args, context, info);
          }
        }) as GraphQLFieldResolver<TSource, TContext, Record<string, any>>
      })
      return fields
    }
  })
}

export class RichGraphqlObjectRootType<TSource, TContext, TArgs = { [key: string]: any }>
  extends GraphQLObjectType
{
  constructor(private config: GraphQLObjectTypeConfig<any, any>) {
    super(config);
  }

  toConfig(): GraphQLObjectTypeConfig<any, any> {
    return this.config;
  }

  update(extensionParam: RootObjectTypeExtension<TSource, TContext, TArgs>): RichGraphqlObjectType<TSource, TContext, TArgs> {
    const currentFields: GraphQLFieldConfigMap<TSource, TContext> = (this.config.fields as () => GraphQLFieldConfigMap<TSource, TContext>)();
    let newFields: GraphQLFieldConfigMap<TSource, TContext> = {};

    Object.keys(extensionParam).forEach(key => {
      if (this.getFields()[key]) {
        const resolve = currentFields[key].resolve;
        newFields[key] = {
          ...currentFields[key],
          resolve: (source: any, args: any, context: any, info: any) => {}
        };
        newFields[key].resolve = ((source: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo) => {
          if (extensionParam[key] && extensionParam[key].permission && !extensionParam[key].permission!(source, context, args)) {
            throw new GraphQLError("Forbiden Error");
          }
          if (resolve) {
            return resolve(source, args, context, info);
          }
        }) as GraphQLFieldResolver<TSource, TContext, Record<string, any>>
      }
    });

    return new RichGraphqlObjectType({
      ...this.config,
      fields: newFields
    })
  }
}



export class RichGraphqlObjectType<TSource, TContext, TArgs = { [key: string]: any }>
  extends GraphQLObjectType
{
  constructor(private config: GraphQLObjectTypeConfig<any, any>) {
    super(config);
  }

  toConfig(): GraphQLObjectTypeConfig<any, any> {
    return this.config;
  }

  update(extensionParam: ObjectTypeExtension<TSource, TContext, TArgs>): RichGraphqlObjectType<TSource, TContext, TArgs> {
    const currentFields: GraphQLFieldConfigMap<TSource, TContext> = (this.config.fields as () => GraphQLFieldConfigMap<TSource, TContext>)();
    let newFields: GraphQLFieldConfigMap<TSource, TContext> = {};

    Object.keys(extensionParam).forEach(key => {
      if (this.getFields()[key]) {
        const resolve = currentFields[key].resolve;
        newFields[key] = {
          ...currentFields[key],
          resolve: (source: any, args: any, context: any, info: any) => {}
        };
        newFields[key].resolve = ((source: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo) => {
          if (extensionParam[key] && extensionParam[key].permission && !extensionParam[key].permission!(source, context, args)) {
            throw new GraphQLError("Forbiden Error");
          }
          if (resolve) {
            return resolve(source, args, context, info);
          }
        }) as GraphQLFieldResolver<TSource, TContext, Record<string, any>>
      }
    });

    return new RichGraphqlObjectType({
      ...this.config,
      fields: newFields
    })
  }
}

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
          if (extensionParam[key] && extensionParam[key].permission && !extensionParam[key].permission!(source, context, args)) {
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
