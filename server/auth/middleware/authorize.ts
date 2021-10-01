import { Forbidden, Unauthorized } from 'http-errors';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import roles from '../../user/roles';

function authorize(allowed: string[]): RequestHandler {
  allowed.push(roles.ADMIN);
  return ({ user }: Request, _res: Response, next: NextFunction) => {
    if (!user) throw new Unauthorized('Access restricted');
    if (allowed.includes(user.role)) return next();
    throw new Forbidden('Access denied');
  };
}

export default authorize;
