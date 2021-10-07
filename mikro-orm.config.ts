import * as dotenv from 'dotenv';
import createAppConfig from './server/config';
import entities from './server/shared/database/entities';

dotenv.config();

const { database } = createAppConfig(process.env);

export default { ...database, entities };
