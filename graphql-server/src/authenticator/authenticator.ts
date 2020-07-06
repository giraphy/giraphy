import jwt from 'express-jwt';
import jwksRsa from "jwks-rsa";
import { AuthSetting } from './setting';
import { RequestHandler } from 'express';

export const skipAuthentication = (req: any, res: any, next: any) => next()

export const authenticate = (auth: AuthSetting): RequestHandler => {
    return jwt({
      secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://yuito-work.auth0.com/.well-known/jwks.json`,
      }),
      issuer: `https://yuito-work.auth0.com/`,
      algorithms: ["RS256"],
    });
}
