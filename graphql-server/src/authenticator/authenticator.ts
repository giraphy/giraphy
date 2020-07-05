import jwt from 'express-jwt';
import jwksRsa from "jwks-rsa";
import { AuthSetting } from './setting';

export const authenticate = (auth: AuthSetting) => {
  return (req: any, res: any, next: any) => {
    if (!auth) {
      return next();
    }
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
}
