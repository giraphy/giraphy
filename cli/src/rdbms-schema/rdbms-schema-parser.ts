export type ColumnDefinition = {
  table_name: string,
  column_name: string,
  data_type: string,
  column_key: string,
}

const toFirstCharacterUpperCase = (character: string): string => character.charAt(0).toUpperCase() + character.slice(1);

const columnDefinitionToLowerCase = (columnDefinition: ColumnDefinition): ColumnDefinition => ({
  table_name: columnDefinition.table_name.toLowerCase(),
  column_name: columnDefinition.column_name.toLowerCase(),
  data_type: columnDefinition.data_type.toLowerCase(),
  column_key: columnDefinition.column_key.toLowerCase()
});

const parseRdbmsDataTypeToGraphQlDataType = (rdbmsDataType: string): string => {
  switch (rdbmsDataType.toUpperCase()) {
    case "VARCHAR":
    case "TEXT":
    case "LONGTEXT":
    case "BIGINT":
      return "GraphQLString";
    case "Int":
      return "GraphQLInt";
    default:
      return "GraphQLString";
      // TODO
  }
};

export const tableSchemaToGraphQLSchema = (tableName: string, columnDefinitions: ColumnDefinition[]): string => {
  const lowerCaseTableName = tableName.toLowerCase();
  columnDefinitions = columnDefinitions.map(c => columnDefinitionToLowerCase(c));

  let primaryKey = "";
  let columnDefinitionPart = "";
  let relationDefinitionPart = "";
  let argsPart = "";
  let wherePart = "";

  columnDefinitions.forEach(columnDefinition => {
    if (columnDefinition.column_key === "pri") {
      primaryKey = columnDefinition.column_name
    }
    columnDefinitionPart = columnDefinitionPart + (`    ${columnDefinition.column_name}: {\n` +
    `      type: ${parseRdbmsDataTypeToGraphQlDataType(columnDefinition.data_type)},\n` +
    `    },\n`);

    argsPart = argsPart + `    ${columnDefinition.column_name}: { type: ${parseRdbmsDataTypeToGraphQlDataType(columnDefinition.data_type)} },\n`

    wherePart = wherePart + `    if (args.${columnDefinition.column_name}) return \`\${${lowerCaseTableName}Table}.${columnDefinition.column_name} = \${args.${columnDefinition.column_name}}\`;\n`
  });

  const tableType = `const ${toFirstCharacterUpperCase(lowerCaseTableName)}: GraphQLObjectType = new GraphQLObjectType({\n` +
    `  name: "${toFirstCharacterUpperCase(lowerCaseTableName)}",\n` +
    `  sqlTable: "${tableName}",\n` +
    `  uniqueKey: "${primaryKey}",\n` +
    `  fields: () => ({\n` +
       columnDefinitionPart + relationDefinitionPart +
    `  }),\n` +
    `});\n`

  const tableRootQuery = `const ${lowerCaseTableName} = {\n` +
    `  type: new GraphQLList(${toFirstCharacterUpperCase(lowerCaseTableName)}),\n` +
    `  resolve: (parent, args, context, resolveInfo) =>\n` +
    `    joinMonster(resolveInfo, context, (sql: any) =>\n` +
    `      dbCall(sql, knex, context)\n` +
    `    ),\n` +
    `  args: {\n` +
    argsPart +
    `  },\n` +
    `  where: (${lowerCaseTableName}Table, args, context) => {\n` +
    wherePart +
    `  },\n` +
    `};\n`

  return tableType + tableRootQuery;
};

const importStatementPart = 'import {\n' +
  '  GraphQLInt,\n' +
  '  GraphQLList,\n' +
  '  GraphQLNonNull,\n' +
  '  GraphQLObjectType,\n' +
  '  GraphQLString,\n' +
  '} from "graphql";\n' +
  '\n' +
  'import joinMonster from "join-monster";\n' +
  'import { dbCall } from "./rdbms-client";\n\n';

export const createRdbmsBaseSchema = (tableNames: string[]) => {
  return 'export default new GraphQLObjectType({\n' +
  '  description: "global query object",\n' +
  '  name: "Query",\n' +
  '  fields: () => ({\n' +
  '    version: {\n' +
  '      type: GraphQLString,\n' +
  '      resolve: () => "0.1",\n' +
  '    },\n' +
  tableNames.map(tableName => `    ${tableName}: ${tableName}`).join('\n') + '\n' +
  '  }),\n' +
  '});'
}

export const parseRdbmsSchemaToGraphQLSchema = (tableNames: string[], columnDefinitions: ColumnDefinition[]): string => {
  return importStatementPart +
    tableNames
      .map(tableName =>
          tableSchemaToGraphQLSchema(tableName, columnDefinitions.filter(c => c.table_name.toLowerCase() == tableName.toLowerCase()))
      )
    .join("\n") + "\n" +
    createRdbmsBaseSchema(tableNames.map(t => t.toLowerCase()))
}
