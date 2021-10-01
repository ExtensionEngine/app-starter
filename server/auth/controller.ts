import { Request, Response } from 'express';
import autobind from 'auto-bind';
import IAuthService from './interfaces/service';
import { IContainer } from 'bottlejs';
import IUserRepository from '../user/interfaces/repository';
import { NO_CONTENT } from 'http-status';
import { NotFound } from 'http-errors';
import Scope from './audience';

class AuthController {
  #userRepository: IUserRepository
  #service: IAuthService

  constructor({ authService, userRepository }: IContainer) {
    this.#service = authService;
    this.#userRepository = userRepository;
    autobind(this);
  }

  async me({ user }: Request, res: Response): Promise<Response> {
    const token = this.#service.createToken(user, Scope.Access, '5 days');
    const data = { token, user };
    return res.json({ data });
  }

  async forgotPassword({ body }: Request, res: Response): Promise<Response> {
    const { email } = body;
    const user = await this.#userRepository.findOne({ email });
    if (!user) throw new NotFound('User not found');
    await this.#service.resetPassword(user);
    return res.status(NO_CONTENT).send();
  }

  async resetPassword({ body, user }: Request, res: Response): Promise<Response> {
    const { password } = body;
    this.#userRepository.assign(user, { password });
    await this.#userRepository.persistAndFlush(user);
    return res.status(NO_CONTENT).send();
  }
}

export default AuthController;
