import autobind from 'auto-bind';
import IAuthService from '../interfaces/service';
import { IMiddleware } from '../../types/middleware';
import { RequestHandler } from 'express';

class SetRequestContext implements IMiddleware {
  #authService: IAuthService;

  constructor(authService: IAuthService) {
    this.#authService = authService;
    autobind(this);
  }

  handle(...params: Parameters<RequestHandler>): void {
    this.#authService.setRequestContext(...params);
  }
}
export default SetRequestContext;
