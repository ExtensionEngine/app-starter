import * as providers from './providers';
import IMail, { MailData } from './IMail';
import { renderHtml, renderText } from './render';
import { SentMessageInfo, Transporter } from 'nodemailer';
import castArray from 'lodash/castArray';
import { Config } from '../../config';
import joi from 'joi';
import Logger from 'bunyan';
import { MailConfig } from '../../config/mail';
import path from 'path';

const dataSchema = joi.object({
  subject: joi.string().required(),
  from: joi.string(),
  to: joi.string().required(),
  templateName: joi.string().required(),
  templateData: joi.object().required()
});

const templatesDir = path.join(__dirname, './templates/');

class Mail implements IMail {
  #transporter: Transporter
  #log: Logger;
  #config: MailConfig;

  constructor(config: Config, logger: Logger) {
    const { provider } = config.mail;
    this.#transporter = providers[provider](config);
    this.#log = logger.child({ service: 'mail' });
    this.#config = config.mail;
  }

  private get from(): string {
    const { name, address } = this.#config.sender;
    return `${name} <${address}>`;
  }

  async send(data: MailData): Promise<SentMessageInfo> {
    joi.assert(data, dataSchema);
    const { subject, templateName, templateData } = data;
    const from = data.from || this.from;
    const html = renderHtml(path.join(templatesDir, `${templateName}.mjml`), templateData);
    const text = renderText(path.join(templatesDir, `${templateName}.txt`), templateData);
    const to = castArray(data.to);
    const mail = {
      from,
      to,
      text,
      subject,
      html
    };
    return this.#transporter.sendMail(mail)
      .then(info => {
        this.#log.info(`Email with ID ${info.messageId} send successfully: `, info);
        return info;
      })
      .catch(err => this.#log.error({
        message: 'Email send failed:',
        error: err.message
      }));
  }
}

export default Mail;
