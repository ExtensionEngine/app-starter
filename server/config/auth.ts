import Env from '../types/env';
import joi from 'joi';

type Cookie = {
  name: string,
  secret: string,
  secure: boolean,
  signed: boolean,
  httpOnly: boolean
};

type Jwt = {
  secret: string,
  issuer: string,
  cookie: Cookie
};

export interface AuthConfig {
  jwt: Jwt;
  corsAllowedOrigins: string[];
}

const cookieSchema = joi.object({
  name: joi.string().default('access_token'),
  secret: joi.string().required()
}).unknown();

const jwtSchema = joi.object({
  secret: joi.string().required(),
  issuer: joi.string().required(),
  cookie: cookieSchema
});

const schema = joi.object({
  jwt: jwtSchema,
  corsAllowedOrigins: joi.array().items(joi.string().uri())
});

const createConfig = (env: Env): AuthConfig => ({
  jwt: {
    secret: env.AUTH_JWT_SECRET,
    issuer: env.AUTH_JWT_ISSUER,
    cookie: {
      name: env.AUTH_JWT_COOKIE_NAME,
      secret: env.AUTH_JWT_COOKIE_SECRET,
      secure: true,
      signed: true,
      httpOnly: true
    }
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
