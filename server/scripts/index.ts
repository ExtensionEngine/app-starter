import cognito from './cognito';
import mongoToPostgres from './mongo-to-postgres';
import seed from './seeds';

export default [seed, cognito, mongoToPostgres];
