import jwt from 'express-jwt';
import jwksRsa from "jwks-rsa";
import { AuthSetting } from './setting';
import { RequestHandler, Request, Response, NextFunction } from 'express';

const skipAuthentication = (req: Request<any>, res: Response, next: NextFunction) => next()

export const authenticate = (auth: AuthSetting): RequestHandler => {
    if (!auth || auth.type !== "jwt") {
      return skipAuthentication
    }
    return jwt({
      secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: auth.jwksUri,
      }),
      issuer: auth.issuer,
      algorithms: auth.algorithms,
    });
}
