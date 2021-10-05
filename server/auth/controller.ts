import { Request, Response } from 'express';
import authContext from './context';
import autobind from 'auto-bind';
import IAuthService from './interfaces/service';
import { IContainer } from 'bottlejs';
import IUserNotificationService from '../user/interfaces/notification.service';
import IUserRepository from '../user/interfaces/repository';
import { NO_CONTENT } from 'http-status';
import { NotFound } from 'http-errors';
import Scope from './audience';
class AuthController {
  #userRepository: IUserRepository;
  #authService: IAuthService;
  #userNotificationService: IUserNotificationService;

  constructor({ authService, userRepository, userNotificationService }: IContainer) {
    this.#authService = authService;
    this.#userRepository = userRepository;
    this.#userNotificationService = userNotificationService;
    autobind(this);
  }

  async me(_req: Request, res: Response): Promise<Response> {
    const user = authContext.getCurrentUser();
    const token = this.#authService.createToken(user, Scope.Access, '5 days');
    const data = { token, user };
    return res.json({ data });
  }

  async forgotPassword({ body }: Request, res: Response): Promise<Response> {
    const { email } = body;
    const user = await this.#userRepository.findOne({ email });
    if (!user) throw new NotFound('User not found');
    await this.#userNotificationService.resetPassword(user);
    return res.status(NO_CONTENT).send();
  }

  async resetPassword({ body }: Request, res: Response): Promise<Response> {
    const { password } = body;
    const user = authContext.getCurrentUser();
    this.#userRepository.assign(user, { password });
    await this.#userRepository.persistAndFlush(user);
    return res.status(NO_CONTENT).send();
  }
}

export default AuthController;
