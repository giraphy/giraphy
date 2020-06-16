const knex = require("knex")({
  client: "mysql",
  connection: {
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "example",
  },
});

export const fetchSchema = () => {
  const result = knex.raw("show create table users;")
    .then((a: any) => {
      console.log(a);
    });
  console.log(result);
};
