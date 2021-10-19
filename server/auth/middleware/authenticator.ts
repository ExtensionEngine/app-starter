import { NextFunction, Request, RequestHandler, Response } from 'express';
import addDays from 'date-fns/addDays';
import AudienceScope from '../audience';
import { AuthConfig } from '../../config/auth';
import autobind from 'auto-bind';
import { Config } from '../../config';
import context from '../context';
import IAuthService from '../interfaces/service';
import passport from 'passport';
import { Unauthorized } from 'http-errors';
import User from '../../user/model';

type AuthenticateOptions = { setCookie: boolean };

class Authenticator {
  #config: AuthConfig;
  #authService: IAuthService;

  constructor(config: Config, authService: IAuthService) {
    this.#config = config.auth;
    this.#authService = authService;
    autobind(this);
  }

  authenticate(strategy: string, options?: AuthenticateOptions): RequestHandler {
    const { setCookie = false } = options || {};
    return (req: Request, res: Response, next: NextFunction) => {
      return passport.authenticate(strategy, (error, user) => {
        if (error) throw error;
        if (!user) next(new Unauthorized());
        if (setCookie) this.setCookie(res, user);
        return context.runWithUser(user, next);
      })(req, res, next);
    };
  }

  logout(middleware?: boolean): RequestHandler {
    return (_req: Request, res: Response, next: NextFunction) => {
      res.clearCookie(this.#config.jwt.cookie.name);
      return middleware ? next() : res.end();
    };
  }

  private setCookie(res: Response, user: User): void {
    const token = this.#authService.createToken(user, AudienceScope.Access, '5 days');
    const { name, signed, secure, httpOnly } = this.#config.jwt.cookie;
    const expires = addDays(new Date(), 5);
    const options = { signed, secure, expires, httpOnly };
    res.cookie(name, token, options);
  }
}

export default Authenticator;
