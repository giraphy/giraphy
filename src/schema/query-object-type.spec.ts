import { QueryObjectType } from './query-object-type';
import { GraphQLResolveInfo, GraphQLString } from 'graphql';
import { GraphQLFieldConfigMap } from 'graphql/type/definition';
import { RelationQuery } from './rdbms/rdbms-query';

describe("QueryObjectType", () => {
  const queryObjectType = new QueryObjectType<undefined, {id: string}>({
    name: "Test",
    fields: () => ({
      id: {
        type: GraphQLString,
        resolve: ((source, args, context) => 1)
      }
    })
  });

  const childQueryObjectType = new QueryObjectType<undefined, {childId: string, parentId: string}>({
    name: "Child",
    fields: () => ({
      childId: {
        type: GraphQLString,
        resolve: ((source, args, context) => 2)
      },
      parentId: ({
        type: GraphQLString,
        resolve: ((source, args, context) => 1)
      })
    })
  });

  describe("extend relation", () => {
    test("should extend fields with a relation query", () => {
      const relationQuery = new RelationQuery(childQueryObjectType, {
        type: "hasMany",
        from: "id",
        to: "parent_id"
      });
      expect(
        ((queryObjectType.extend("NewType", {
          comments: {
            relation: relationQuery
          }
        }).toConfig().fields) as () => GraphQLFieldConfigMap<any, any>)().comments == relationQuery.config
      );
    });
  });

  describe("extend permission", () => {
    test("should extend a resolver with a permissions and throw Forbidden Error", () => {
      expect(() =>
        queryObjectType.extend("NewType",{
          id: {
            permission: (source, context, args) => context.id == args.id
          }
        }).objectType.getFields()["id"]!.resolve!(undefined, {id: "1"}, {id: "2"}, {} as GraphQLResolveInfo)
      ).toThrowError();
    });

    test("should extend a resolver with a permission and pass the permission", () => {
      expect(
        queryObjectType.extend("NewType",{
          id: {
            permission: (source, context, args) => context.id == args.id
          }
        }).objectType.getFields()["id"]!.resolve!(undefined, {id: "1"}, {id: "1"}, {} as GraphQLResolveInfo)
      ).toBe(1);
    })
  });
});
