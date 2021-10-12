import { NextFunction, Request, RequestHandler, Response } from 'express';
import context from '../context';
import passport from 'passport';
import { Unauthorized } from 'http-errors';

export default authenticate;

function authenticate(strategy: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    return passport.authenticate(strategy, (error, user) => {
      if (error) throw error;
      if (!user) next(new Unauthorized());
      return context.runWithUser(user, next);
    })(req, res, next);
  };
}
