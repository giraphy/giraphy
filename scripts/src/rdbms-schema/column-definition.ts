// fields are defined by snake case because select result is used
export type ColumnDefinition = {
  table_name: string,
  column_name: string,
  data_type: string,
  column_key: string,
}

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

export const parseToArgsPart = (columnDefinitions: ColumnDefinition[]): string => {
  return columnDefinitions.map(columnDefinition =>
    `    ${columnDefinition.column_name}: { type: ${parseRdbmsDataTypeToGraphQlDataType(columnDefinition.data_type)} },`
  ).join("\n") + "\n";
};

export const parseToWherePart = (columnDefinitions: ColumnDefinition[], lowerCaseTableName: string): string => {
  return columnDefinitions.map(columnDefinition =>
    `    if (args.${columnDefinition.column_name}) return \`\${${lowerCaseTableName}Table}.${columnDefinition.column_name} = \${args.${columnDefinition.column_name}}\`;\n`
  ).join("");
};

export const parseToColumnDefinitionPart = (columnDefinitions: ColumnDefinition[]): string => {
  return columnDefinitions.map(columnDefinition =>
    `    ${columnDefinition.column_name}: {\n` +
    `      type: ${parseRdbmsDataTypeToGraphQlDataType(columnDefinition.data_type)},\n` +
    `    },`
  ).join("\n") + "\n";
};

export const getPrimaryKey = (columnDefinitions: ColumnDefinition[]): string => {
  const keyMaybe = columnDefinitions.find(columnDefinition => columnDefinition.column_key === "pri");
  return keyMaybe ? keyMaybe.column_name : "";
};
