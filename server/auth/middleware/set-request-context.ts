import { NextFunction, Request, Response } from 'express';
import autobind from 'auto-bind';
import IAuthService from '../interfaces/service';
import { Middleware } from '../../types/middleware';

class SetRequestContext implements Middleware {
  #authService: IAuthService;

  constructor(authService: IAuthService) {
    this.#authService = authService;
    autobind(this);
  }

  handle(req: Request, res: Response, next: NextFunction): void {
    this.#authService.setRequestContext(req, res, next);
  }
}
export default SetRequestContext;
