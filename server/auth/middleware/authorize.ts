import { Forbidden, Unauthorized } from 'http-errors';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import authContext from '../context';
import roles from '../../user/roles';

function authorize(allowed: string[]): RequestHandler {
  allowed.push(roles.ADMIN);
  return (_req: Request, _res: Response, next: NextFunction) => {
    const user = authContext.getCurrentUser();
    if (!user) throw new Unauthorized('Access restricted');
    if (!allowed.includes(user.role)) throw new Forbidden('Access denied');
    return next();
  };
}

export default authorize;
