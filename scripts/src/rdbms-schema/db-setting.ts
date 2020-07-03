export type DBSetting = {
  type: "MySQL" | "PostgreSQL" | "SQLite3";
  version: string;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}
