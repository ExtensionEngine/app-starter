import { SentMessageInfo } from 'nodemailer';

export type MailData = {
  subject: string,
  from?: string,
  to: string,
  templateName: string,
  templateData: any
};

interface IMail {
  send(data: MailData): Promise<SentMessageInfo>;
}

export default IMail;
