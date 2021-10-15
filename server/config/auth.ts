import Env from '../types/env';
import joi from 'joi';

type Jwt = {
  secret: string,
  scheme: string,
  issuer: string
}

export interface AuthConfig {
  jwt: Jwt;
  corsAllowedOrigins: string[];
}

const jwtSchema = joi.object({
  secret: joi.string().required(),
  scheme: joi.string().required(),
  issuer: joi.string().required()
});

const schema = joi.object({
  jwt: jwtSchema,
  corsAllowedOrigins: joi.array().items(joi.string().uri())
});

const createConfig = (env: Env): AuthConfig => ({
  jwt: {
    scheme: env.AUTH_JWT_SCHEME,
    secret: env.AUTH_JWT_SECRET,
    issuer: env.AUTH_JWT_ISSUER
  },
  corsAllowedOrigins: getCorsAllowedOrigins(env.CORS_ALLOWED_ORIGINS)
});

export default (env: Env): AuthConfig => joi.attempt(createConfig(env), schema);

function getCorsAllowedOrigins(origins: string): string[] {
  return origins
    .split(',')
    .filter(s => s)
    .map(s => s.trim());
}
