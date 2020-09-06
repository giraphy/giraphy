import joinMonster from 'join-monster';
import { dbClient } from './rdbms-client';

export type RdbmsClient = {
  raw: (sql: string) => Promise<any>
}

export type RdbmsDBSetting = {
  type: "MySQL" | "PostgreSQL" | "SQLite3";
  version: string;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export const executeQuery = <TSource, TContext, TArgs = { [argName: string]: any }>(resolveInfo: any, context: TContext): Promise<any> => {
  const f = (sql: string) => {
    console.log(sql);
    return dbClient
      .raw(sql.split('"').join(""))
      .then((result: any) => (result.length > 0 ? result[0] : null))
  };
  return joinMonster(resolveInfo, context, f, {
    dialect: "mysql8"
  });
};
