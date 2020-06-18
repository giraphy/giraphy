import { ColumnDefinition, parseRdbmsDdlToSchema } from './rdbms-schema-parser';

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
      '});\n' +
      'const users = {\n' +
      '  type: new GraphQLList(Users),\n' +
      '  resolve: (parent, args, context, resolveInfo) =>\n' +
      '    joinMonster(resolveInfo, context, (sql: any) =>\n' +
      '      dbCall(sql, knex, context)\n' +
      '    ),\n' +
      '  args: {\n' +
      '    user_id: { type: GraphQLString },\n' +
      '    email: { type: GraphQLString },\n'+
      '  },\n' +
      '  where: (usersTable, args, context) => {\n' +
      '    if (args.user_id) return `${usersTable}.user_id = ${args.user_id}`;\n' +
      '    if (args.email) return `${usersTable}.email = ${args.email}`;\n' +
      '  },\n' +
      '};\n'
    );
  });
});
