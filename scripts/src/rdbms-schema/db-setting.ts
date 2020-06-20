export type DBSetting = {
  kind: "MySQL" | "PostgreSQL" | "SQLite3";
  version: string;
  host: string;
  user: string;
  password: string;
  database: string;
}
