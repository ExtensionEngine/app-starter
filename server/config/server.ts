import IEnv from '../types/env';
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

function createConfig(env: IEnv): ServerConfig {
  const { HOSTNAME, IMPORT_TEMPLATE_FORMAT, IP } = env;
  const protocol = resolveProtocol(HOSTNAME);
  const port = resolvePort();
  const origin = resolveOrigin(HOSTNAME, protocol, port);
  return {
    hostname: HOSTNAME,
    ip: IP,
    port,
    protocol,
    origin,
    importTemplateFormat: IMPORT_TEMPLATE_FORMAT
  };
}

export default (env: IEnv): ServerConfig => joi.attempt(createConfig(env), schema);

function resolveProtocol(hostname): string {
  const { PROTOCOL } = process.env;
  if (PROTOCOL) return PROTOCOL;
  return isLocalhost(hostname) ? 'http' : 'https';
}

function resolvePort(): number {
  const { PORT, SERVER_PORT } = process.env;
  return Number(PORT || SERVER_PORT || 3000);
}

function resolveOrigin(hostname = 'localhost', protocol = 'http', port = 3000): string {
  return `${protocol}://${hostname}${resolveOriginPort(port)}`;
}

function resolveOriginPort(port): string {
  const { REVERSE_PROXY_PORT } = process.env;
  if (!REVERSE_PROXY_PORT) return `:${port}`;
  if (REVERSE_PROXY_PORT === '80' || REVERSE_PROXY_PORT === '443') return '';
  return `:${REVERSE_PROXY_PORT}`;
}
