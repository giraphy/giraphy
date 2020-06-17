export type RdbmsSchema = {
  table: string,
  primaryKey: string,
  columns: {
    name: string,
    type: string,
    notNulL: boolean
  }[],
}

const tableRegex = /^CREATE TABLE `(.+)` \(/;
const primaryKeyRegex = /PRIMARY KEY \(`(.+)`\)/;
const columnsRegex = /\([^\(\)]*(\([^\(\)]*[^\(\)]*\)[^\(\)]*)*[^\(\)]*\)/;

export type ColumnDefinition = {
  COLUMN_NAME: string,
  DATA_TYPE: string,
  COLUMN_KEY: string,
}

const toFirstCharcterUpperCase = (character: string): string => character.charAt(0).toUpperCase() + character.slice(1);

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

  let primaryKey = "";
  let columnDefinitionPart = "";
  let relationDefinitionPart = "";

  columnDefinitions.forEach(columnDefinition => {
    if (columnDefinition.COLUMN_KEY === "PRI") {
      primaryKey = columnDefinition.COLUMN_NAME
    }
    columnDefinitionPart = columnDefinitionPart + (`    ${columnDefinition.COLUMN_NAME}: {\n` +
    `      type: ${parseRdbmsDataTypeToGraphQlDataType(columnDefinition.DATA_TYPE)},\n` +
    `    },\n`);
  });

  return `const ${toFirstCharcterUpperCase(tableName)}: GraphQLObjectType = new GraphQLObjectType({\n` +
    `  name: "${toFirstCharcterUpperCase(tableName)}",\n` +
    `  sqlTable: "${tableName}",\n` +
    `  uniqueKey: "${primaryKey}",\n` +
    `  fields: () => ({\n` +
       columnDefinitionPart + relationDefinitionPart +
    `  }),\n` +
    `});`
};
