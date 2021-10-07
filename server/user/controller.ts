import { ACCEPTED, NO_CONTENT } from 'http-status';
import { Request, Response } from 'express';
import autobind from 'auto-bind';
import { IContainer } from 'bottlejs';
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
  #repository: IUserRepository;
  #userNotificationService: IUserNotificationService;
  #userImportService: IUserImportService;

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
    const { role, email, filter } = query;
    const { showArchived } = pagination;
    const where = {
      ...filter && { $or: createFilter(filter) },
      ...email && { email: email as string },
      ...role && { role: role as Role },
      ...!showArchived && { deletedAt: null }
    };
    const [items, total] = await this.#repository.findAndCount(where, pagination);
    return res.json({ data: { items, total } });
  }

  async get({ user }: Request, res: Response): Promise<Response> {
    return res.json({ data: user });
  }

  async createOrRestore({ body }: Request, res: Response): Promise<Response> {
    joi.attempt(body, userSchema);
    const { id, firstName, lastName, email, role, password } = body;
    const user = id
      ? await this.#repository.findOne(Number(id))
      : new User(firstName, lastName, email, role, password);
    if (id) this.#repository.assign(user, { deletedAt: null });
    await this.#repository.persistAndFlush(user);
    return res.json({ data: user });
  }

  async patch({ user, body }: Request, res: Response): Promise<Response> {
    const userData = joi.attempt(body, userSchema);
    this.#repository.assign(user, userData);
    await this.#repository.persistAndFlush(user);
    return res.json({ data: user });
  }

  async remove({ user }: Request, res: Response): Promise<Response> {
    this.#repository.assign(user, { deletedAt: new Date() });
    await this.#repository.persistAndFlush(user);
    return res.status(NO_CONTENT).send();
  }

  async invite({ user }: Request, res: Response): Promise<Response> {
    await this.#userNotificationService.invite(user);
    return res.status(ACCEPTED).send();
  }

  async bulkImport({ body = {}, file }: Request, res: Response): Promise<Response> {
    const { users, tuples } = await this.#userImportService.bulkImport(file);
    const errors = await P.reduce(tuples, (errs: any, [err, user], idx) => {
      const { message = 'Failed to import user.' } = err;
      if (!err && user) this.#userNotificationService.invite(user)
      else errs.push({ ...users[idx], message });
      return errs;
    }, []);
    // res.set('data-imported-count', String(users.length - errors.length));
    // if (!errors.length) return res.send();
    // const errorSheet = await this.#userImportService.getErrorSheet(errors);
    // const format = body.format || mime.extension(file.mimetype);
    // const report = await this.#userImportService.createReport(errorSheet);
    // return report.send(res, { format });
    return res.json({ data: errors });
  }

  async getImportTemplate(_req: Request, res: Response): Promise<Response> {
    const sheet = this.#userImportService.getImportTemplate();
    const report = await this.#userImportService.createReport(sheet);
    return report.send(res, { format: this.#userImportService.templateFormat });
  }
}

export default UserController;
