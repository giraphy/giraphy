import { ColumnDefinition, parseRdbmsDdlToSchema } from './rdbms-schema-parser';

// sql共通のinformation_schemaから取得すべき
// select * FROM information_schema.columns where table_schema = 'example';




describe("parseRdbmsDdlToSchema ", () => {
  test("should return GraphQL schema", () => {

    const columnDefinitions: ColumnDefinition[] = [
      {
        COLUMN_NAME: "user_id",
        DATA_TYPE: "bigint",
        COLUMN_KEY: "PRI",
      },
      {
        COLUMN_NAME: "email",
        DATA_TYPE: "text",
        COLUMN_KEY: "",
      },
    ];

    expect(parseRdbmsDdlToSchema("users", columnDefinitions)).toBe(
      'const Users: GraphQLObjectType = new GraphQLObjectType({\n' +
      '  name: "Users",\n' +
      '  sqlTable: "users",\n' +
      '  uniqueKey: "user_id",\n' +
      '  fields: () => ({\n' +
      '    user_id: {\n' +
      '      type: GraphQLString,\n' +
      '    },\n' +
      '    email: {\n' +
      '      type: GraphQLString,\n' +
      '    },\n' +
      '  }),\n' +
      '});'
    );
  });
});
