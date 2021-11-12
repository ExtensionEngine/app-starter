import nodemailer, { Transporter } from 'nodemailer';
import { Config } from '../../../config';

function createMailtrapTransporter(config: Config): Transporter<any> {
  return nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    auth: {
      user: config.mail.user,
      pass: config.mail.password
    }
  });
}

export default createMailtrapTransporter;
