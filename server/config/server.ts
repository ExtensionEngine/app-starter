import Env from '../types/env';
import isLocalhost from 'is-localhost';
import joi from 'joi';

export interface ServerConfig {
  port: number;
  protocol: string;
  origin: string;
  hostname: string;
  ip: string;
  importTemplateFormat: string;
}

const schema = joi.object({
  port: joi.number().port().default(3000),
  hostname: joi.string().hostname().default('localhost'),
  ip: joi.string().ip(),
  origin: joi.string().uri(),
  protocol: joi.string(),
  importTemplateFormat: joi.string().default('xlsx')
});

function createConfig(env: Env): ServerConfig {
  const protocol = resolveProtocol(env);
  const port = resolvePort(env);
  const origin = resolveOrigin(env, protocol, port);
  return {
    hostname: env.HOSTNAME,
    ip: env.IP,
    port,
    protocol,
    origin,
    importTemplateFormat: env.IMPORT_TEMPLATE_FORMAT
  };
}

export default (env: Env): ServerConfig => joi.attempt(createConfig(env), schema);

function resolveProtocol({ PROTOCOL, HOSTNAME }: Env): string {
  if (PROTOCOL) return PROTOCOL;
  return isLocalhost(HOSTNAME) ? 'http' : 'https';
}

function resolvePort({ PORT, SERVER_PORT }: Env): number {
  return Number(PORT || SERVER_PORT || 3000);
}

function resolveOrigin(env: Env, protocol = 'http', port = 3000): string {
  const hostname = env.HOSTNAME || 'localhost';
  const originPort = resolveOriginPort(env, port);
  return `${protocol}://${hostname}${originPort}`;
}

function resolveOriginPort({ REVERSE_PROXY_PORT }: Env, port): string {
  if (!REVERSE_PROXY_PORT) return `:${port}`;
  if (REVERSE_PROXY_PORT === '80' || REVERSE_PROXY_PORT === '443') return '';
  return `:${REVERSE_PROXY_PORT}`;
}
