import IProcessEnv from '../types/processEnv';
import joi from 'joi';

export interface AuthConfig {
  secret: string,
  scheme: string,
  issuer: string,
  corsAllowedOrigins: string[],
  saltRounds: number
}

const schema = joi.object({
  secret: joi.string().required(),
  scheme: joi.string().required(),
  issuer: joi.string().empty(''),
  saltRounds: joi.number().required(),
  corsAllowedOrigins: joi.array().items(joi.string().uri())
});

const createConfig = (env: IProcessEnv): AuthConfig => ({
  scheme: env.AUTH_JWT_SCHEME || 'JWT',
  secret: env.AUTH_JWT_SECRET,
  issuer: env.AUTH_JWT_ISSUER,
  saltRounds: parseInt(process.env.AUTH_SALT_ROUNDS, 10),
  corsAllowedOrigins: getCorsAllowedOrigins(env.CORS_ALLOWED_ORIGINS)
});

export default (env: IProcessEnv): AuthConfig => joi.attempt(createConfig(env), schema);

function getCorsAllowedOrigins(origins: string): string[] {
  return origins
    .split(',')
    .filter(s => s)
    .map(s => s.trim());
}