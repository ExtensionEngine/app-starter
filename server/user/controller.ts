import { ACCEPTED, NO_CONTENT } from 'http-status';
import { Request, Response } from 'express';
import autobind from 'auto-bind';
import { IContainer } from 'bottlejs';
import IUserNotificationService from './interfaces/notification.service';
import IUserRepository from './interfaces/repository';
import joi from 'joi';
import { Role } from './roles';
import User from './model';
import userSchema from './validation';

const createFilter = q => ['email', 'firstName', 'lastName'].map(field => ({
  [field]: { $ilike: `%${q}%` }
}));

class UserController {
  #repository: IUserRepository;
  #userNotificationService: IUserNotificationService;

  constructor({ userRepository, userNotificationService }: IContainer) {
    this.#repository = userRepository;
    this.#userNotificationService = userNotificationService;
    autobind(this);
  }

  async list({ query, pagination }: Request, res: Response): Promise<Response> {
    const { role, email, filter } = query;
    const where = {
      ...filter && { $or: createFilter(filter) },
      ...email && { email: email as string },
      ...role && { role: role as Role }
    };
    const data = await this.#repository.find(where, pagination);
    return res.json({ data });
  }

  async get({ targetUser }: Request, res: Response): Promise<Response> {
    return res.json({ data: targetUser });
  }

  async create({ body }: Request, res: Response): Promise<Response> {
    joi.attempt(body, userSchema);
    const { firstName, lastName, email, role, password } = body;
    const data = new User(firstName, lastName, email, role, password);
    await this.#repository.persistAndFlush(data);
    return res.json({ data });
  }

  async patch({ targetUser, body }: Request, res: Response): Promise<Response> {
    const userData = joi.attempt(body, userSchema);
    this.#repository.assign(targetUser, userData);
    await this.#repository.persistAndFlush(targetUser);
    return res.json({ data: targetUser });
  }

  async remove({ targetUser }: Request, res: Response): Promise<Response> {
    await this.#repository.removeAndFlush(targetUser);
    return res.status(NO_CONTENT).send();
  }

  async invite({ targetUser }: Request, res: Response): Promise<Response> {
    await this.#userNotificationService.invite(targetUser);
    return res.status(ACCEPTED).send();
  }
}

export default UserController;
