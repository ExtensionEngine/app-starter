import IEnv from '../types/env';
import joi from 'joi';

type Jwt = {
  secret: string,
  scheme: string,
  issuer: string
}

export interface AuthConfig {
  jwt: Jwt
  saltRounds: number,
  corsAllowedOrigins: string[],
}

const jwtSchema = joi.object().keys({
  secret: joi.string().required(),
  scheme: joi.string().required(),
  issuer: joi.string().required()
});

const schema = joi.object({
  jwt: jwtSchema,
  saltRounds: joi.number().required(),
  corsAllowedOrigins: joi.array().items(joi.string().uri())
});

const createConfig = (env: IEnv): AuthConfig => ({
  jwt: {
    scheme: env.AUTH_JWT_SCHEME || 'JWT',
    secret: env.AUTH_JWT_SECRET,
    issuer: env.AUTH_JWT_ISSUER
  },
  saltRounds: parseInt(process.env.AUTH_SALT_ROUNDS, 10),
  corsAllowedOrigins: getCorsAllowedOrigins(env.CORS_ALLOWED_ORIGINS)
});

export default (env: IEnv): AuthConfig => joi.attempt(createConfig(env), schema);

function getCorsAllowedOrigins(origins: string): string[] {
  return origins
    .split(',')
    .filter(s => s)
    .map(s => s.trim());
}
