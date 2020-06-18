export type ColumnDefinition = {
  COLUMN_NAME: string,
  DATA_TYPE: string,
  COLUMN_KEY: string,
}

const toFirstCharacterUpperCase = (character: string): string => character.charAt(0).toUpperCase() + character.slice(1);

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

export const parseRdbmsDdlToSchema = (tableName: string, columnDefinitions: ColumnDefinition[]): string => {
  tableName = tableName.toLowerCase();

  let primaryKey = "";
  let columnDefinitionPart = "";
  let relationDefinitionPart = "";
  let argsPart = "";
  let wherePart = "";

  columnDefinitions.forEach(columnDefinition => {
    if (columnDefinition.COLUMN_KEY === "PRI") {
      primaryKey = columnDefinition.COLUMN_NAME
    }
    columnDefinitionPart = columnDefinitionPart + (`    ${columnDefinition.COLUMN_NAME}: {\n` +
    `      type: ${parseRdbmsDataTypeToGraphQlDataType(columnDefinition.DATA_TYPE)},\n` +
    `    },\n`);

    argsPart = argsPart + `    ${columnDefinition.COLUMN_NAME}: { type: ${parseRdbmsDataTypeToGraphQlDataType(columnDefinition.DATA_TYPE)} },\n`

    wherePart = wherePart + `    if (args.${columnDefinition.COLUMN_NAME}) return \`\${${tableName}Table}.${columnDefinition.COLUMN_NAME} = \${args.${columnDefinition.COLUMN_NAME}}\`;\n`
  });

  const tableType = `const ${toFirstCharacterUpperCase(tableName)}: GraphQLObjectType = new GraphQLObjectType({\n` +
    `  name: "${toFirstCharacterUpperCase(tableName)}",\n` +
    `  sqlTable: "${tableName}",\n` +
    `  uniqueKey: "${primaryKey}",\n` +
    `  fields: () => ({\n` +
       columnDefinitionPart + relationDefinitionPart +
    `  }),\n` +
    `});\n`

  const tableRootQuery = `const ${tableName} = {\n` +
    `  type: new GraphQLList(${toFirstCharacterUpperCase(tableName)}),\n` +
    `  resolve: (parent, args, context, resolveInfo) =>\n` +
    `    joinMonster(resolveInfo, context, (sql: any) =>\n` +
    `      dbCall(sql, knex, context)\n` +
    `    ),\n` +
    `  args: {\n` +
    argsPart +
    `  },\n` +
    `  where: (${tableName}Table, args, context) => {\n` +
    wherePart +
    `  },\n` +
    `};\n`

  return tableType + tableRootQuery;
};
