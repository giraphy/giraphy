import { tableSchemaToGraphQLSchema } from './rdbms-schema-parser';
import { ColumnDefinition } from './column-definition';
import { RelationDefinition } from './relation-definition';

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
      {
        table_name: "comments",
        column_name: "comment_id",
        data_type: "bigint",
        column_key: "PRI"
      },
      {
        table_name: "comments",
        column_name: "user_id",
        data_type: "bigint",
        column_key: "FRI"
      },
      {
        table_name: "comments",
        column_name: "body",
        data_type: "text",
        column_key: ""
      }
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
      '      args: {\n' +
      '    comment_id: { type: GraphQLString },\n' +
      '    user_id: { type: GraphQLString },\n' +
      '    body: { type: GraphQLString },\n' +
      '      },\n' +
      '      where: (commentsTable, args, context) => {\n' +
      '    let condition = "";\n' +
      '    let andMaybe = "";\n' +
      '    if (args.comment_id) {\n' +
      '      condition = condition + andMaybe + `${commentsTable}.comment_id = ${SqlString.escape(args.comment_id)}`;\n' +
      '      andMaybe = " and ";\n' +
      '    }\n' +
      '    if (args.user_id) {\n' +
      '      condition = condition + andMaybe + `${commentsTable}.user_id = ${SqlString.escape(args.user_id)}`;\n' +
      '      andMaybe = " and ";\n' +
      '    }\n' +
      '    if (args.body) {\n' +
      '      condition = condition + andMaybe + `${commentsTable}.body = ${SqlString.escape(args.body)}`;\n' +
      '      andMaybe = " and ";\n' +
      '    }\n' +
      '    return condition;\n' +
      '      },\n' +
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
      '    let condition = "";\n' +
      '    let andMaybe = "";\n' +
      '    if (args.user_id) {\n' +
      '      condition = condition + andMaybe + `${usersTable}.user_id = ${SqlString.escape(args.user_id)}`;\n' +
      '      andMaybe = " and ";\n' +
      '    }\n' +
      '    if (args.email) {\n' +
      '      condition = condition + andMaybe + `${usersTable}.email = ${SqlString.escape(args.email)}`;\n' +
      '      andMaybe = " and ";\n' +
      '    }\n' +
      '    return condition;\n' +
      '  },\n' +
      '};\n'
    );
  });
});
