import autobind from 'auto-bind';
import { Config } from '../config';
import Datasheet from '../shared/datasheet';
import { File } from 'multer';
import find from 'lodash/find';
import { generateUsers } from '../shared/helpers';
import IUserImportService from './interfaces/import.service';
import IUserRepository from './interfaces/repository';
import transform from 'lodash/transform';
import User from '../user/model';
import { UserDTO } from './interfaces/dtos';
import { Workbook } from 'exceljs';

export type Sheet = {
  name: string,
  columns: {
    [key: string]: { header: string, width: number }
  },
  data: UserDTO[]
}

const columns = {
  email: { header: 'Email', width: 30 },
  firstName: { header: 'First Name', width: 30 },
  lastName: { header: 'Last Name', width: 30 },
  role: { header: 'Role', width: 30 },
  message: { header: 'Error', width: 30 }
};

class UserImportService implements IUserImportService {
  #config: Config;
  #userRepository: IUserRepository;

  constructor(config: Config, userRepository: IUserRepository) {
    this.#config = config;
    this.#userRepository = userRepository;
    autobind(this);
  }

  get templateFormat(): string {
    return this.#config.server.importTemplateFormat;
  }

  async bulkImport(file: File): Promise<any> {
    const inputAttrs = ['email', 'role', 'firstName', 'lastName'];
    const loadedFile = await Datasheet.load(file);
    const users = loadedFile.toJSON({ include: inputAttrs });
    const dbUsers = await this.#userRepository.findAll();
    const results = transform(users, (acc, item, idx) => {
      const found = find(dbUsers, { email: item.email });
      if (found) {
        return acc.errors.push({ ...users[idx], message: 'User already exists' });
      }
      const { firstName, lastName, email, role } = item;
      const user = new User(firstName, lastName, email, role);
      return acc.users.push(user);
    }, { users: [], errors: [] });
    await this.#userRepository.persistAndFlush(results.users);
    return { total: users, ...results };
  }

  getErrorSheet(errors: UserDTO[]): Sheet {
    const message = { header: 'Error', width: 30 };
    return { name: 'Errors', columns: { ...columns, message }, data: errors };
  }

  getImportTemplate(): Sheet {
    return { name: 'Template', columns, data: generateUsers() };
  }

  createReport(sheet: Sheet): Workbook {
    const creator = 'App Starter';
    const report = (new Datasheet(sheet)).toWorkbook({ creator });
    return report;
  }
}

export default UserImportService;