import { NextFunction, Request, Response } from 'express';
import autobind from 'auto-bind';
import { IContainer } from 'bottlejs';
import { IMiddleware } from '../../types/middleware';
import IUserRepository from '../interfaces/repository';
import { NotFound } from 'http-errors';

class GetTargetUserMiddleware implements IMiddleware {
  #userRepository: IUserRepository;

  constructor({ userRepository }: IContainer) {
    this.#userRepository = userRepository;
    autobind(this);
  }

  async handle(req: Request, _: Response, next: NextFunction, id: string): Promise<void> {
    const user = await this.#userRepository.findOne(Number(id));
    if (!user) throw new NotFound('User not found');
    req.targetUser = user;
    next();
  }
}

export default GetTargetUserMiddleware;
