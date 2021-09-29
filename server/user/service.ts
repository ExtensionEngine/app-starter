import autobind from 'auto-bind';
import { IContainer } from 'bottlejs';
import IMail from '../shared/mail/IMail';
import IUserService from './interfaces/service';
import { ServerConfig } from '../config/server';
import { URL } from 'url';
import User from './model';

class UserService implements IUserService {
  #mail: IMail;
  #serverConfig: ServerConfig;

  constructor({ config, mail }: IContainer) {
    this.#mail = mail;
    this.#serverConfig = config.server;
    autobind(this);
  }

  private resetUrl(token) {
    return `${this.#serverConfig.origin}/#/auth/reset-password/${token}`;
  }

  async invite(user: User): Promise<User> {
    const href = this.resetUrl(user.token);
    const { origin, hostname } = this.#serverConfig;
    const recipient = user.email;
    const recipientName = user.firstName;
    const templateData = { href, origin, hostname: new URL(hostname), recipientName };
    await this.#mail.send({
      to: recipient,
      subject: 'Invite',
      templateName: 'welcome',
      templateData
    });
    return user;
  }

  async resetPassword(user: User): Promise<User> {
    const href = this.resetUrl(user.token);
    const templateData = { href, recipientName: user.firstName };
    await this.#mail.send({
      to: user.email,
      subject: 'Reset password',
      templateName: 'reset',
      templateData
    });
    return user;
  }
}

export default UserService;
