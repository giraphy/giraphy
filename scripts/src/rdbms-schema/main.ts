import * as fs from 'fs'
import { ColumnDefinition, parseRdbmsSchemaToGraphQLSchema } from './rdbms-schema-parser';
import { DBSetting } from './db-setting';
import { createKnex } from './knex-client';

const giraphySetting = JSON.parse(fs.readFileSync('./giraphy.json', 'utf8'));
const relationSetting = JSON.parse(fs.readFileSync('./relation.json', 'utf8'));
const dbSetting: DBSetting = giraphySetting["db"];

export const createRdbmsSchema = async () => {
  const knex = createKnex(dbSetting);
  await knex.raw(`select table_name from information_schema.tables where table_schema = '${dbSetting.database}';`);
  const tableResult = await knex.raw(`select table_name from information_schema.tables where table_schema = '${dbSetting.database}';`);
  const tableRows = tableResult[0] as { table_name: string }[];
  const columnResult = await knex.raw(`select table_name, column_name, data_type, column_key from information_schema.columns where table_schema = '${dbSetting.database}';`);
  const columnDefinitions = columnResult[0] as ColumnDefinition[];
  const result = parseRdbmsSchemaToGraphQLSchema(tableRows.map(t => t.table_name), columnDefinitions, dbSetting, relationSetting);
  fs.writeFileSync('schema.js', result);
  process.exit(0);
};
