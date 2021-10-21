
import { File } from 'multer';
import { UserDTO } from './dtos';

export type SheetData = {
  name: string,
  columns: {
    [key: string]: { header: string, width: number }
  },
  data: UserDTO[]
};

interface IUserImportService {
  bulkImport(file: File): Promise<any>;
  getErrorSheetData(errors: UserDTO[]): SheetData;
  getImportTemplate(): SheetData;
  createSheet(sheetData: SheetData): any;
  get templateFormat(): string;
}

export default IUserImportService;
