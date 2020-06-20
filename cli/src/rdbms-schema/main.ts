import * as fs from 'fs'
import { ColumnDefinition, parseRdbmsSchemaToGraphQLSchema } from './rdbms-schema-parser';

type DBSetting = {
  kind: "MySQL" | "PostgreSQL" | "SQLite3";
  version: string;
  host: string;
  user: string;
  password: string;
  database: string;
}

type RdbmsType = "MySQL" | "PostgreSQL" | "SQLite3";
type KnexDbType = "mysql" | "pg" | "sqlite3"

const rdbmsTypeToKnexType = (rdbmsType: RdbmsType): KnexDbType => {
  switch (rdbmsType) {
    case "MySQL": return "mysql";
    case "PostgreSQL": return "pg";
    case 'SQLite3': return "sqlite3";
  }
}

const giraphySetting = JSON.parse(fs.readFileSync('./giraphy.json', 'utf8'));

const dbSetting: DBSetting = giraphySetting["db"];

const knex = require("knex")({
  client: rdbmsTypeToKnexType(dbSetting.kind),
  connection: {
    host: dbSetting.host,
    user: dbSetting.user,
    password: dbSetting.password,
    database: "information_schema",
  },
});

export const createRdbmsSchema = async () => {
  await knex.raw(`select table_name from information_schema.tables where table_schema = '${dbSetting.database}';`);
  const tableResult = await knex.raw(`select table_name from information_schema.tables where table_schema = '${dbSetting.database}';`)
  const tableRows = tableResult[0] as { table_name: string }[]
  const columnResult = await knex.raw(`select table_name, column_name, data_type, column_key from information_schema.columns where table_schema = '${dbSetting.database}';`)
  const columnDefinitions = columnResult[0] as ColumnDefinition[];
  const result = parseRdbmsSchemaToGraphQLSchema(tableRows.map(t => t.table_name), columnDefinitions);
  fs.writeFileSync('schema.ts', result);
  process.exit(0);
}
