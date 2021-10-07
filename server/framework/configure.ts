import * as dotenv from 'dotenv';
import createConfig from '../config';
import IProgram from '../types/program';
import { Provider } from './provider';

dotenv.config();

export default configure;

function configure(provider: Provider, program: IProgram): void {
  provider.factory('config', () => createConfig(process.env));
  program.configure(provider);
}
