
import { File } from 'multer';
import { Sheet } from '../import.service';
import { UserDTO } from './dtos';
import { Workbook } from 'exceljs';

interface IUserImportService {
  bulkImport(file: File): Promise<any>;
  getErrorSheet(errors: UserDTO[]): Sheet;
  getImportTemplate(): Sheet;
  createReport(sheet: Sheet): Workbook;
}

export default IUserImportService;
