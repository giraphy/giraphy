import express, { Request, Response } from "express";
import graphqlHTTP from "express-graphql";

import * as core from "express-serve-static-core";
import { schema } from "./schema/schema";
import bodyParser from "body-parser";
import { parse, Source } from "graphql";
import { authorize } from "./authorizer/authorizer";
import { permissionPolicy } from "./conf/permission-policy";
import { authenticate } from "./authenticator/authenticator";

export const app = (request: Request, response: Response) => {
  authenticate()



  return graphqlHTTP({
    schema,
    graphiql: true
  })
};

// class App {
//   public express: core.Express;
//
//   constructor() {
//     this.express = express();
//     this.express.use(bodyParser.urlencoded({ extended: true }));
//     this.express.use(bodyParser.text({ type: "application/graphql" }));
//     this.express.use(bodyParser.json());
//     this.mountRoutes();
//   }
//
//   private mountRoutes(): void {
//     const router = express.Router();
//
//     router.post("/graphql", authenticate, (req, res) => {
//       const document = parse(new Source(req.body["query"]));
//       const context = (req as any)["user"] ? (req as any)["user"] : {};
//       try {
//         if (permissionPolicy) {
//           authorize(document, context, permissionPolicy);
//         }
//         return graphqlHTTP({
//           schema: schema,
//           graphiql: true,
//         })(req, res);
//       } catch (e) {
//         if (e.name === "ForbiddenError") {
//           res.status(403);
//           res.send({
//             errors: [
//               {
//                 message: e.message,
//                 locations: [],
//                 path: [],
//                 extensions: {
//                   code: e.name,
//                 },
//               },
//             ],
//           });
//         }
//         throw e;
//       }
//     });
//     this.express.use("/", router);
//   }
// }
//
// export default new App().express;
