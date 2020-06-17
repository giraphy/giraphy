const knex = require("knex")({
  client: "mysql",
  connection: {
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "information_schema",
  },
});

export const fetchSchema = () => {
  const result = knex.raw("select * FROM information_schema.columns where table_schema = 'example';")
    .then((a: any) => {
      console.log(a);
    });
  console.log(result);
};
