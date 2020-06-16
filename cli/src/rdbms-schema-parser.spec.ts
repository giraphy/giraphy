import { parseRdbmsDdlToSchema } from './rdbms-schema-parser';

// sql共通のinformation_schemaから取得すべき
// select * FROM information_schema.columns where table_schema = 'example';




describe("parseRdbmsDdlToSchema ", () => {
  test("should return GraphQL schema", () => {
    const ddl = "CREATE TABLE `users` (\n" +
      "  `user_id` bigint(20) unsigned NOT NULL,\n" +
      "  `email` varchar(100) COLLATE utf8mb4_bin NOT NULL,\n" +
      "  PRIMARY KEY (`user_id`)\n" +
      ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin";

    expect(parseRdbmsDdlToSchema(ddl)).toEqual({
      table: "users",
      primaryKey: "user_id",
      columns: [
        {
          name: "user_id",
          type: "bigint",
          notNull: true
        },
        {
          name: "email",
          type: "varchar",
          notNull: true
        }
      ]
    });
  });
});
