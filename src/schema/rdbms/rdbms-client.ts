import * as yaml from 'js-yaml';
import fs from "fs";
import { RdbmsClient, RdbmsDBSetting } from './rdbms-schema';

type RdbmsType = "MySQL" | "PostgreSQL" | "SQLite3";
type KnexDbType = "mysql" | "pg" | "sqlite3"

export const rdbmsTypeToKnexType = (rdbmsType: RdbmsType): KnexDbType => {
  switch (rdbmsType) {
    case "MySQL": return "mysql";
    case "PostgreSQL": return "pg";
    case 'SQLite3': return "sqlite3";
  }
};

const dbSetting: RdbmsDBSetting = (yaml.safeLoad((fs.readFileSync('./giraphy.yaml', 'utf8'))) as (any | undefined)).database;

if (!dbSetting) {
  throw new Error("database setting is required in giraphy.yaml");
}

export const dbClient: RdbmsClient = require("knex")({
  client: rdbmsTypeToKnexType(dbSetting.type),
  connection: {
    host: dbSetting.host,
    user: dbSetting.user,
    password: dbSetting.password,
    database: dbSetting.database,
    port: dbSetting.port,
  },
});
