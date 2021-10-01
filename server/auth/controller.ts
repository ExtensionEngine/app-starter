import { Request, Response } from 'express';
import autobind from 'auto-bind';
import IAuthService from './interfaces/service';
import { IContainer } from 'bottlejs';
import Scope from './audience';

class AuthController {
  #authService: IAuthService

  constructor({ authService }: IContainer) {
    this.#authService = authService;
    autobind(this);
  }

  async me({ user }: Request, res: Response): Promise<Response> {
    const token = this.#authService.createToken(user, Scope.Access, '5 days');
    const data = { token, user };
    return res.json({ data });
  }
}

export default AuthController;
