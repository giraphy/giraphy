import express from "express";
import graphqlHTTP from "express-graphql";

import bodyParser from "body-parser";
import { authenticate } from "./authenticator/authenticator";
import fs from "fs";
import * as yaml from 'js-yaml';
import { AuthSetting } from './authenticator/setting';
import { RdbmsDBSetting } from './schema/rdbms/rdbms-schema';
import { GraphQLSchema } from 'graphql';

const initRouter = (schema: GraphQLSchema): express.Router => {
  const giraphySetting = yaml.safeLoad((fs.readFileSync('./giraphy.yaml', 'utf8'))) as (any | undefined);
  if (!giraphySetting) {
    throw new Error("giraphy.yaml is required")
  }

  const authSettingMaybe = giraphySetting.auth as AuthSetting;
  const dbSettingMaybe = giraphySetting.database as RdbmsDBSetting;

  if (!dbSettingMaybe) {
    throw new Error("database setting is required in giraphy.yaml");
  }

  let router =  express.Router();
  router.post("/graphql", authenticate(authSettingMaybe), (req, res) => {
    const context = (req as any)["user"] ? (req as any)["user"] : {};

    return graphqlHTTP({
      schema: schema,
      graphiql: true,
      context: context
    })(req, res);
  });

  return router;
};

export const initGiraphyApp = (schema: GraphQLSchema): void => {
  let app = express();
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.text({ type: "application/graphql" }));
  app.use(bodyParser.json());
  app.use("/", initRouter(schema));
  app.listen(3000, () => {
    return console.log(`Giraphy server is listening on ${3000}`);
  });
};
