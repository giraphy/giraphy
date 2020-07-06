import { schema } from './schema/schema';
import graphqlHTTP = require('express-graphql');

export default graphqlHTTP({
  schema,
  graphiql: true
});
