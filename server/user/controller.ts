import { ACCEPTED, NO_CONTENT } from 'http-status';
import { Request, Response } from 'express';
import autobind from 'auto-bind';
import { IContainer } from 'bottlejs';
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
  #repository: IUserRepository;
  #userNotificationService: IUserNotificationService;
  #userImportService;

  constructor({
    userRepository,
    userNotificationService,
    userImportService
  }: IContainer) {
    this.#repository = userRepository;
    this.#userNotificationService = userNotificationService;
    this.#userImportService = userImportService;
    autobind(this);
  }

  async list({ query, pagination }: Request, res: Response): Promise<Response> {
    const { role, email, filter, isArchived } = query;
    const where = {
      ...filter && { $or: createFilter(filter) },
      ...email && { email: email as string },
      ...role && { role: role as Role },
      ...isArchived && { deletedAt: null }
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
    this.#repository.assign(targetUser, { deletedAt: new Date() });
    await this.#repository.persistAndFlush(targetUser);
    return res.status(NO_CONTENT).send();
  }

  async invite({ targetUser }: Request, res: Response): Promise<Response> {
    await this.#userNotificationService.invite(targetUser);
    return res.status(ACCEPTED).send();
  }

  async bulkImport({ body = {}, file }: Request, res: Response): Promise<Response> {
    const { total, users, errors } = await this.#userImportService.bulkImport(file);
    await P.each(users, async (it: User) => {
      await P.delay(500);
      return this.#userNotificationService.invite(it);
    });
    res.set('data-imported-count', String(total.length - errors.length));
    if (!errors) return res.send();
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
