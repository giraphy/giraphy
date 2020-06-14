import { RequestHandler } from 'express';

export const authenticate: RequestHandler = (req: any, res: any, next: any) => {
  next();
};
