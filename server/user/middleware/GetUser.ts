import { NextFunction, Request, Response } from 'express';
import autobind from 'auto-bind';
import { IMiddleware } from '../../types/middleware';
import IUserRepository from '../interfaces/repository';
import { NotFound } from 'http-errors';

class GetUserMiddleware implements IMiddleware {
  #userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.#userRepository = userRepository;
    autobind(this);
  }

  async handle(req: Request, _: Response, next: NextFunction, id: string): Promise<void> {
    const user = await this.#userRepository.findOne(Number(id));
    if (!user) throw new NotFound('User not found');
    req.user = user;
    next();
  }
}

export default GetUserMiddleware;
