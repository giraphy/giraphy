import {
  GraphQLError,
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  GraphQLObjectType,
  GraphQLResolveInfo,
} from 'graphql';
import { GraphQLFieldConfig } from 'graphql/type/definition';

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
