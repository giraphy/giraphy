import { DBSetting } from './db-setting';
import { rdbmsTypeToKnexType } from './knex-client';

export type ColumnDefinition = {
  table_name: string,
  column_name: string,
  data_type: string,
  column_key: string,
}

type RelationType = 'hasOne' | 'hasMany';

export type RelationDefinition = {
  name: string,
  type: RelationType,
  from: {
    table: string,
    column: string
  },
  to: {
    table: string,
    column: string,
  }
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

const parseRelationTypeToGraphQLType = (relationType: RelationType, targetType: string): string => {
  switch (relationType) {
    case 'hasMany':
      return `new GraphQLList(${targetType})`;
    case 'hasOne':
      return targetType;
  }
};

export const tableSchemaToGraphQLSchema = (tableName: string, columnDefinitions: ColumnDefinition[], relationDefinitions: RelationDefinition[]): string => {
  const lowerCaseTableName = tableName.toLowerCase();
  columnDefinitions = columnDefinitions.map(c => columnDefinitionToLowerCase(c));

  let primaryKey = "";
  let columnDefinitionPart = "";
  let argsPart = "";
  let wherePart = "";

  columnDefinitions.forEach(columnDefinition => {
    if (columnDefinition.column_key === "pri") {
      primaryKey = columnDefinition.column_name
    }
    columnDefinitionPart = columnDefinitionPart + (`    ${columnDefinition.column_name}: {\n` +
    `      type: ${parseRdbmsDataTypeToGraphQlDataType(columnDefinition.data_type)},\n` +
    `    },\n`);

    argsPart = argsPart + `    ${columnDefinition.column_name}: { type: ${parseRdbmsDataTypeToGraphQlDataType(columnDefinition.data_type)} },\n`;

    wherePart = wherePart + `    if (args.${columnDefinition.column_name}) return \`\${${lowerCaseTableName}Table}.${columnDefinition.column_name} = \${args.${columnDefinition.column_name}}\`;\n`
  });

  const relationDefinitionPart = relationDefinitions.map(relationDefinition => {
    return `    ${relationDefinition.name}: {\n` +
      `      type: ${parseRelationTypeToGraphQLType(relationDefinition.type, toFirstCharacterUpperCase(relationDefinition.to.table))},\n` +
      `      sqlJoin: (${relationDefinition.from.table}Table, ${relationDefinition.to.table}Table) =>\n` +
      `        \`\$\{${relationDefinition.from.table}Table\}.${relationDefinition.from.column} = \$\{${relationDefinition.to.table}Table\}.${relationDefinition.to.column}\`,\n` +
      `    },`
  }).join("\n") + "\n";

  const tableType = `const ${toFirstCharacterUpperCase(lowerCaseTableName)} = new GraphQLObjectType({\n` +
    `  name: "${toFirstCharacterUpperCase(lowerCaseTableName)}",\n` +
    `  sqlTable: "${tableName}",\n` +
    `  uniqueKey: "${primaryKey}",\n` +
    `  fields: () => ({\n` +
       columnDefinitionPart + relationDefinitionPart +
    `  }),\n` +
    `});\n`;

  const tableRootQuery = `const ${lowerCaseTableName} = {\n` +
    `  type: new GraphQLList(${toFirstCharacterUpperCase(lowerCaseTableName)}),\n` +
    `  resolve: (parent, args, context, resolveInfo) =>\n` +
    `    joinMonster.default(resolveInfo, context, (sql) =>\n` +
    `      dbCall(sql, context)\n` +
    `    ),\n` +
    `  args: {\n` +
    argsPart +
    `  },\n` +
    `  where: (${lowerCaseTableName}Table, args, context) => {\n` +
    wherePart +
    `  },\n` +
    `};\n`;

  return tableType + tableRootQuery;
};

const importStatementPart = 'const {\n' +
  '  GraphQLInt,\n' +
  '  GraphQLList,\n' +
  '  GraphQLNonNull,\n' +
  '  GraphQLObjectType,\n' +
  '  GraphQLString,\n' +
  '  GraphQLSchema,\n' +
  '} = require("graphql");\n' +
  '\n' +
  'const __importDefault = (this && this.__importDefault) || function (mod) {\n' +
  '  return (mod && mod.__esModule) ? mod : { "default": mod };\n' +
  '};\n' +
  'const joinMonster = __importDefault(require("join-monster"));\n\n';

const dbCallPart = (dbSetting: DBSetting) => {
  return 'const knex = require("knex")({\n' +
    `  client: "${rdbmsTypeToKnexType(dbSetting.kind)}",\n` +
    '  connection: {\n' +
    `    host: "${dbSetting.host}",\n` +
    `    user: "${dbSetting.user}",\n` +
    `    password: "${dbSetting.password}",\n` +
    `    database: "${dbSetting.database}",\n` +
    '  },\n' +
    '});\n' +
    'const dbCall = (sql, context) => {\n' +
    '  return knex\n' +
    '    .raw(sql.split(\'"\').join(""))\n' +
    '    .then(result => (result.length > 0 ? result[0] : null));\n' +
    '};\n\n';
};

export const createRdbmsBaseSchema = (tableNames: string[]) => {
  return 'exports.schema = new GraphQLSchema({\n' +
  '  query: new GraphQLObjectType({\n' +
  '    description: "global query object",\n' +
  '    name: "Query",\n' +
  '    fields: () => ({\n' +
  '      version: {\n' +
  '        type: GraphQLString,\n' +
  '        resolve: () => "0.1",\n' +
  '      },\n' +
  tableNames.map(tableName => `      ${tableName}: ${tableName}`).join(',\n') + ',\n' +
  '    }),\n' +
  '  }),\n' +
  '});'
};

export const parseRdbmsSchemaToGraphQLSchema = (tableNames: string[], columnDefinitions: ColumnDefinition[], relationDefinitions: RelationDefinition[], dbSetting: DBSetting): string => {
  return importStatementPart +
    dbCallPart(dbSetting) +
    tableNames
      .map(tableName =>
          tableSchemaToGraphQLSchema(tableName, columnDefinitions.filter(c => c.table_name.toLowerCase() == tableName.toLowerCase()), relationDefinitions)
      )
    .join("\n") + "\n" +
    createRdbmsBaseSchema(tableNames.map(t => t.toLowerCase()))
};
