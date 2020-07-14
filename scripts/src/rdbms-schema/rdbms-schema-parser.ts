import { DBSetting } from './db-setting';
import { rdbmsTypeToKnexType } from './knex-client';
import { RelationSetting } from './relation-setting';
import {
  ColumnDefinition,
  getPrimaryKey,
  parseToColumnDefinitionPart,
  parseToArgsPart,
  parseToWherePart
} from './column-definition';
import { parseToRelationPart, RelationDefinition } from './relation-definition';

const toFirstCharacterUpperCase = (character: string): string => character.charAt(0).toUpperCase() + character.slice(1);

const columnDefinitionToLowerCase = (columnDefinition: ColumnDefinition): ColumnDefinition => ({
  table_name: columnDefinition.table_name.toLowerCase(),
  column_name: columnDefinition.column_name.toLowerCase(),
  data_type: columnDefinition.data_type.toLowerCase(),
  column_key: columnDefinition.column_key.toLowerCase()
});

export const tableSchemaToGraphQLSchema = (tableName: string, allColumnDefinitions: ColumnDefinition[], relationDefinitions: RelationDefinition[]): string => {
  const targetColumnDefinitions = allColumnDefinitions.filter(c => c.table_name.toLowerCase() == tableName.toLowerCase()).map(c => columnDefinitionToLowerCase(c));
  const lowerCaseTableName = tableName.toLowerCase();

  const primaryKey = getPrimaryKey(targetColumnDefinitions);
  const columnDefinitionPart = parseToColumnDefinitionPart(targetColumnDefinitions);
  const argsPart = parseToArgsPart(targetColumnDefinitions);
  const wherePart = parseToWherePart(targetColumnDefinitions, lowerCaseTableName);
  const relationDefinitionPart = parseToRelationPart(relationDefinitions, allColumnDefinitions);

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
  'const SqlString = require("sqlstring");\n' +
  'const joinMonster = __importDefault(require("join-monster"));\n\n';

const dbCallPart = (dbSetting: DBSetting) => {
  return 'const knex = require("knex")({\n' +
    `  client: "${rdbmsTypeToKnexType(dbSetting.type)}",\n` +
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

export const parseRdbmsSchemaToGraphQLSchema = (tableNames: string[], columnDefinitions: ColumnDefinition[], dbSetting: DBSetting, relationSettingMaybe: RelationSetting | undefined): string => {
  return importStatementPart +
    dbCallPart(dbSetting) +
    tableNames
      .map(tableName => {
        let relationDefinitions: RelationDefinition[] = [];
        if (relationSettingMaybe) {
          const relationDefinitionMapMaybe = relationSettingMaybe[tableName.toLowerCase()];
          if (!relationDefinitionMapMaybe) {
            return;
          }

          relationDefinitions = Object.keys(relationDefinitionMapMaybe).map(relationMapKey => {
            return ({
              ...relationDefinitionMapMaybe[relationMapKey],
              name: relationMapKey
            })
          });
        }
        return tableSchemaToGraphQLSchema(tableName, columnDefinitions, relationDefinitions)
      })
    .join("\n") + "\n" +
    createRdbmsBaseSchema(tableNames.map(t => t.toLowerCase()))
};
