import { ACCEPTED, NO_CONTENT } from 'http-status';
import { Request, Response } from 'express';
import autobind from 'auto-bind';
import IUserImportService from './interfaces/import.service';
import IUserNotificationService from './interfaces/notification.service';
import IUserRepository from './interfaces/repository';
import joi from 'joi';
import mime from 'mime-types';
import P from 'bluebird';
import { Role } from './roles';
import User from './model';
import userSchema from './validation';

const createFilter = q => ['email', 'firstName', 'lastName'].map(field => ({
  [field]: { $ilike: `%${q}%` }
}));

class UserController {
  #userRepository: IUserRepository;
  #userNotificationService: IUserNotificationService;
  #userImportService: IUserImportService;

  constructor(
    userRepository: IUserRepository,
    userNotificationService: IUserNotificationService,
    userImportService: IUserImportService
  ) {
    this.#userRepository = userRepository;
    this.#userNotificationService = userNotificationService;
    this.#userImportService = userImportService;
    autobind(this);
  }

  async list({ query, pagination }: Request, res: Response): Promise<Response> {
    const { role, email, filter } = query;
    const { showArchived } = pagination;
    const where = {
      ...filter && { $or: createFilter(filter) },
      ...email && { email: email as string },
      ...role && { role: role as Role },
      ...!showArchived && { deletedAt: null }
    };
    const [items, total] = await this.#userRepository.findAndCount(where, pagination);
    return res.json({ data: { items, total } });
  }

  async get({ user }: Request, res: Response): Promise<Response> {
    return res.json({ data: user });
  }

  async createOrRestore({ body }: Request, res: Response): Promise<Response> {
    joi.attempt(body, userSchema);
    const { id, firstName, lastName, email, role, password } = body;
    const user = id
      ? await this.#userRepository.findOne(Number(id))
      : new User(firstName, lastName, email, role, password);
    if (id) this.#userRepository.assign(user, { deletedAt: null });
    await this.#userRepository.persistAndFlush(user);
    await this.#userNotificationService.invite(user);
    return res.json({ data: user });
  }

  async patch({ user, body }: Request, res: Response): Promise<Response> {
    const userData = joi.attempt(body, userSchema);
    this.#userRepository.assign(user, userData);
    await this.#userRepository.persistAndFlush(user);
    return res.json({ data: user });
  }

  async remove({ user }: Request, res: Response): Promise<Response> {
    this.#userRepository.assign(user, { deletedAt: new Date() });
    await this.#userRepository.persistAndFlush(user);
    return res.status(NO_CONTENT).send();
  }

  async invite({ user }: Request, res: Response): Promise<Response> {
    await this.#userNotificationService.invite(user);
    return res.status(ACCEPTED).send();
  }

  async bulkImport({ body = {}, file }: Request, res: Response): Promise<Response> {
    const { total, users, errors } = await this.#userImportService.bulkImport(file);
    await P.each(users, (it: User) => this.#userNotificationService.invite(it));
    res.set('data-imported-count', String(total.length - errors.length));
    if (!errors.length) return res.send();
    const errorSheet = await this.#userImportService.getErrorSheet(errors);
    const format = body.format || mime.extension(file.mimetype);
    const report = await this.#userImportService.createReport(errorSheet);
    return report.send(res, { format });
  }

  async getImportTemplate(_req: Request, res: Response): Promise<Response> {
    const sheet = this.#userImportService.getImportTemplate();
    const report = await this.#userImportService.createReport(sheet);
    return report.send(res, { format: this.#userImportService.templateFormat });
  }
}

export default UserController;
