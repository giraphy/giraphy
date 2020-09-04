import { QueryObjectType } from './query-object-type';
import { GraphQLResolveInfo, GraphQLString } from 'graphql';

describe("QueryObjectType", () => {
  describe("extend", () => {
    const queryObjectType = new QueryObjectType<undefined, {id: string}>({
      name: "Test",
      fields: () => ({
        id: {
          type: GraphQLString,
          resolve: ((source, args, context) => 1)
        }
      })
    })

    test("should extend a resolver with a permissions and throw Forbidden Error", () => {
      expect(() =>
        queryObjectType.extend({
          id: {
            permission: (source, context, args) => context.id == args.id
          }
        }).objectType.getFields()["id"]!.resolve!(undefined, {id: "1"}, {id: "2"}, {} as GraphQLResolveInfo)
      ).toThrowError();
    });

    test("should extend a resolver with a permission and pass the permission", () => {
      expect(
        queryObjectType.extend({
          id: {
            permission: (source, context, args) => context.id == args.id
          }
        }).objectType.getFields()["id"]!.resolve!(undefined, {id: "1"}, {id: "1"}, {} as GraphQLResolveInfo)
      ).toBe(1);
    })
  });
});
