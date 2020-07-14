import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { parseRdbmsSchemaToGraphQLSchema } from './rdbms-schema-parser';
import { DBSetting } from './db-setting';
import { createKnex } from './knex-client';
import { RelationSetting } from './relation-setting';
import { ColumnDefinition } from './column-definition';

const giraphySetting = yaml.safeLoad((fs.readFileSync('./giraphy.yaml', 'utf8'))) as (any | undefined);
if (!giraphySetting) {
  throw new Error("giraphy.yaml is required")
}

const dbSetting: DBSetting | undefined = giraphySetting["database"];
if (!dbSetting) {
  throw new Error("database setting is required")
}

const relationSetting: RelationSetting | undefined = giraphySetting["relation"];

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
