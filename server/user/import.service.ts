import autobind from 'auto-bind';
import { Config } from '../config';
import Datasheet from '../shared/datasheet';
import { File } from 'multer';
import { generateUsers } from '../shared/helpers';
import IUserImportService from './interfaces/import.service';
import map from 'lodash/map';
import User from '../user/model';
import { UserDTO } from './interfaces/dtos';
import { IRestoreService } from '../shared/restore';

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
  #restoreService: IRestoreService;

  constructor(config: Config, restoreService: IRestoreService) {
    this.#config = config;
    this.#restoreService = restoreService;
    autobind(this);
  }

  get templateFormat(): string {
    return this.#config.server.importTemplateFormat;
  }

  async bulkImport(file: File): Promise<any> {
    const inputAttrs = ['email', 'role', 'firstName', 'lastName'];
    const loadedFile = await Datasheet.load(file);
    const users = loadedFile.toJSON({ include: inputAttrs });
    const where = { email: map(users, 'email') };
    const tuples = await this.#restoreService.restoreOrCreateAll(
      'User',
      User,
      users,
      where,
      { modelSearchKey: 'email' }
    );
    return { users, tuples };
  }

  getErrorSheet(errors: UserDTO[]): Sheet {
    const message = { header: 'Error', width: 30 };
    return { name: 'Errors', columns: { ...columns, message }, data: errors };
  }

  getImportTemplate(): Sheet {
    return { name: 'Template', columns, data: generateUsers() };
  }

  createReport(sheet: Sheet): any {
    const creator = 'App Starter';
    const report = (new Datasheet(sheet)).toWorkbook({ creator });
    return report;
  }
}

export default UserImportService;
