import { RequestHandler } from 'express';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';

export const authenticate = async () => {
  const client = new jwksRsa.JwksClient({
    strictSsl: true, // Default value
    jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json',
    requestHeaders: {}, // Optional
    requestAgentOptions: {}, // Optional
    timeout: ms('30s'), // Defaults to 30s
    proxy: '[protocol]://[username]:[pass]@[address]:[port]', // Optional
  });

  client.getSigningKeys()



  const secret = await jwksRsa.koaJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://yuito-work.auth0.com/.well-known/jwks.json`,
  })

  jwt.verify()
}
