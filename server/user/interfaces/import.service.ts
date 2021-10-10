
import { File } from 'multer';
import { SheetData } from '../import.service';
import { UserDTO } from './dtos';

interface IUserImportService {
  bulkImport(file: File): Promise<any>;
  getErrorSheetData(errors: UserDTO[]): SheetData;
  getImportTemplate(): SheetData;
  createSheet(sheetData: SheetData): any;
  get templateFormat(): string;
}

export default IUserImportService;
