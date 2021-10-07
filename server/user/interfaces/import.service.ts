
import { File } from 'multer';
import { Sheet } from '../import.service';
import { UserDTO } from './dtos';

interface IUserImportService {
  bulkImport(file: File): Promise<any>;
  getErrorSheet(errors: UserDTO[]): Sheet;
  getImportTemplate(): Sheet;
  createReport(sheet: Sheet): any;
  get templateFormat(): string;
}

export default IUserImportService;
