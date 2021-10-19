import { Request, Response } from 'express';
import authContext from './context';
import autobind from 'auto-bind';
import IUserNotificationService from '../user/interfaces/notification.service';
import IUserRepository from '../user/interfaces/repository';
import { NO_CONTENT } from 'http-status';
import { NotFound } from 'http-errors';

class AuthController {
  #userRepository: IUserRepository;
  #userNotificationService: IUserNotificationService;

  constructor(
    userRepository: IUserRepository,
    userNotificationService: IUserNotificationService
  ) {
    this.#userRepository = userRepository;
    this.#userNotificationService = userNotificationService;
    autobind(this);
  }

  me(_req: Request, res: Response): Response {
    const user = authContext.getCurrentUser();
    return res.json({ data: user });
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
