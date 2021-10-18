import Env from '../types/env';
import joi from 'joi';

type Sender = {
  name: string,
  address: string
};

export interface MailConfig {
  sender: Sender;
  provider: string;
  host: string;
  port: number;
  user: string;
  password?: string;
}

const schema = joi.object({
  provider: joi.string().valid('ses', 'mailtrap').required(),
  sender: joi.object({
    name: joi.string(),
    address: joi.string()
  }),
  host: joi.string().hostname().when('provider', {
    not: 'ses',
    then: joi.required()
  }),
  port: joi.number().port(),
  user: joi.string(),
  password: joi.string()
});

const createConfig = (env: Env): MailConfig => ({
  sender: {
    name: env.EMAIL_SENDER_NAME,
    address: env.EMAIL_SENDER_ADDRESS
  },
  provider: env.EMAIL_PROVIDER,
  user: env.EMAIL_USER,
  password: env.EMAIL_PASSWORD,
  host: env.EMAIL_HOST,
  port: Number(env.EMAIL_PORT)
});

export default (env: Env): MailConfig => joi.attempt(createConfig(env), schema);
