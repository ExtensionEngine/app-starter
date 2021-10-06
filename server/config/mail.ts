import IEnv from '../types/env';
import joi from 'joi';

type Sender = {
  name: string,
  address: string
}

export interface MailConfig {
  sender: Sender;
  provider: string;
  host: string;
  port?: number;
  user: string;
  password?: string;
}

const schema = joi.object({
  provider: joi.string().valid('ses', 'mailtrap').required(),
  sender: joi.object(),
  host: joi.string().hostname().when('provider', {
    not: 'ses',
    then: joi.required()
  }),
  port: joi.number().port(),
  user: joi.string(),
  password: joi.string()
});

function createConfig(env: IEnv): MailConfig {
  const sender: Sender = {
    name: env.EMAIL_SENDER_NAME,
    address: env.EMAIL_SENDER_ADDRESS
  };
  return {
    sender,
    provider: env.EMAIL_PROVIDER,
    user: env.EMAIL_USER,
    password: env.EMAIL_PASSWORD,
    host: env.EMAIL_HOST,
    port: Number(env.EMAIL_PORT)
  };
}

export default (env: IEnv): MailConfig => joi.attempt(createConfig(env), schema);
