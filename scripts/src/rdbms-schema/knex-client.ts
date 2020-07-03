import { DBSetting } from './db-setting';

type RdbmsType = "MySQL" | "PostgreSQL" | "SQLite3";
type KnexDbType = "mysql" | "pg" | "sqlite3"

export const rdbmsTypeToKnexType = (rdbmsType: RdbmsType): KnexDbType => {
  switch (rdbmsType) {
    case "MySQL": return "mysql";
    case "PostgreSQL": return "pg";
    case 'SQLite3': return "sqlite3";
  }
};

export const createKnex = (dbSetting: DBSetting) => require("knex")({
  client: rdbmsTypeToKnexType(dbSetting.type),
  connection: {
    host: dbSetting.host,
    user: dbSetting.user,
    password: dbSetting.password,
    database: "information_schema",
    port: dbSetting.port,
  },
});
