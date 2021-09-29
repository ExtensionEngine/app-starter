import { ACCEPTED, NO_CONTENT } from 'http-status';
import { Request, Response } from 'express';
import autobind from 'auto-bind';
import { IContainer } from 'bottlejs';
import IUserRepository from './interfaces/repository';
import IUserService from './interfaces/service';
import joi from 'joi';
import { Role } from './roles';
import User from './model';
import userSchema from './validation';

const createFilter = q => ['email', 'firstName', 'lastName'].map(field => ({
  [field]: { $ilike: `%${q}%` }
}));

class UserController {
  #repository: IUserRepository
  #userService: IUserService

  constructor({ userRepository, userService }: IContainer) {
    this.#repository = userRepository;
    this.#userService = userService;
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

  async get(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.userId);
    const data = await this.#repository.findOne(id);
    return res.json({ data });
  }

  async create({ body }: Request, res: Response): Promise<Response> {
    const { firstName, lastName, email, role, password } = body;
    const data = new User(firstName, lastName, email, role, password);
    await this.#repository.persistAndFlush(data);
    return res.json({ data });
  }

  async patch({ params, body }: Request, res: Response): Promise<Response> {
    const userData = joi.attempt(body, userSchema);
    const id = Number(params.userId);
    const user = await this.#repository.findOne(id);
    this.#repository.assign(user, userData);
    await this.#repository.persistAndFlush(user);
    return res.json({ data: user });
  }

  async remove({ params }: Request, res: Response): Promise<Response> {
    const id = Number(params.userId);
    const user = await this.#repository.findOne(id);
    await this.#repository.removeAndFlush(user);
    return res.status(NO_CONTENT).send();
  }

  async invite({ params }: Request, res: Response): Promise<Response> {
    const id = Number(params.userId);
    const user = await this.#repository.findOne(id);
    await this.#userService.invite(user);
    return res.status(ACCEPTED).send();
  }
}

export default UserController;
