import IEnv from '../types/env';
import joi from 'joi';
import yn from 'yn';

type Sender = {
  name: string,
  address: string
}

export interface MailConfig {
  sender: Sender;
  host: string;
  port?: number;
  user: string;
  password?: string;
  ssl?: boolean;
  tls?: boolean;
}

const schema = joi.object({
  sender: joi.object(),
  host: joi.string().hostname(),
  port: joi.number().port(),
  user: joi.string(),
  password: joi.string(),
  ssl: joi.boolean(),
  tls: joi.boolean()
});

function createConfig(env: any): MailConfig {
  const sender: Sender = {
    name: env.EMAIL_SENDER_NAME,
    address: env.EMAIL_SENDER_ADDRESS
  };
  return {
    sender,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    ssl: yn(process.env.EMAIL_SSL),
    tls: yn(process.env.EMAIL_TLS)
  };
}

export default (env: IEnv): MailConfig => joi.attempt(createConfig(env), schema);
