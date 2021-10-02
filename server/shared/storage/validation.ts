import { Filesystem, Amazon as S3Config } from '../../config/storage';
import { ObjectSchema } from 'joi';

export function validateConfig(
  config: S3Config | Filesystem,
  schema: ObjectSchema
): any | Error {
  const { error, value } = schema.validate(config, { stripUnknown: true });
  if (error) throw new Error('Unsupported config structure');
  return value;
}
