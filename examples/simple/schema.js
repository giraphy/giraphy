const {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
} = require("graphql");

const __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { "default": mod };
};
const joinMonster = __importDefault(require("join-monster"));

const knex = require("knex")({
  client: "mysql",
  connection: {
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "example",
  },
});
const dbCall = (sql, context) => {
  return knex
    .raw(sql.split('"').join(""))
    .then(result => (result.length > 0 ? result[0] : null));
};



exports.schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    description: "global query object",
    name: "Query",
    fields: () => ({
      version: {
        type: GraphQLString,
        resolve: () => "0.1",
      },
      comments: comments,
      users: users,
    }),
  }),
});