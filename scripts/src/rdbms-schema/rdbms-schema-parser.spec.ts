import { ColumnDefinition, RelationDefinition, tableSchemaToGraphQLSchema } from './rdbms-schema-parser';

describe("parseRdbmsDdlToSchema ", () => {
  test("should return GraphQL schema", () => {

    const columnDefinitions: ColumnDefinition[] = [
      {
        table_name: "users",
        column_name: "user_id",
        data_type: "bigint",
        column_key: "PRI",
      },
      {
        table_name: "users",
        column_name: "email",
        data_type: "text",
        column_key: "",
      },
    ];

    const relationDefinitions: RelationDefinition[] = [
      {
        name: "comments",
        type: "hasMany",
        from: "users.user_id",
        to: "comments.user_id"
      }
    ];

    expect(tableSchemaToGraphQLSchema("users", columnDefinitions, relationDefinitions)).toBe(
      'const Users = new GraphQLObjectType({\n' +
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
      '    comments: {\n' +
      '      type: new GraphQLList(Comments),\n' +
      '      sqlJoin: (usersTable, commentsTable) =>\n' +
      '        `${usersTable}.user_id = ${commentsTable}.user_id`,\n' +
      '    },\n' +
      '  }),\n' +
      '});\n' +
      'const users = {\n' +
      '  type: new GraphQLList(Users),\n' +
      '  resolve: (parent, args, context, resolveInfo) =>\n' +
      '    joinMonster.default(resolveInfo, context, (sql) =>\n' +
      '      dbCall(sql, context)\n' +
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
