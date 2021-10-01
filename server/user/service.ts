import autobind from 'auto-bind';
import { Config } from '../config';
import IAuthService from '../auth/interfaces/service';
import { IContainer } from 'bottlejs';
import IMail from '../shared/mail/IMail';
import IUserService from './interfaces/service';
import Scope from '../auth/audience';
import User from './model';

class UserService implements IUserService {
  #mail: IMail;
  #config: Config;
  #authService: IAuthService;

  constructor({ config, mail, authService }: IContainer) {
    this.#mail = mail;
    this.#authService = authService;
    this.#config = config;
    autobind(this);
  }

  private get serverConfig() {
    return this.#config.server;
  }

  private resetUrl(token) {
    return `${this.serverConfig.origin}/#/auth/reset-password/${token}`;
  }

  async invite(user: User): Promise<User> {
    const token = this.#authService.createToken(user, Scope.Setup, '5 days');
    const href = this.resetUrl(token);
    const { origin, hostname } = this.serverConfig;
    const recipient = user.email;
    const recipientName = user.firstName;
    const templateData = { href, origin, hostname, recipientName };
    await this.#mail.send({
      to: recipient,
      subject: 'Invite',
      templateName: 'welcome',
      templateData
    });
    return user;
  }

  async resetPassword(user: User): Promise<User> {
    const token = this.#authService.createToken(user, Scope.Setup, '5 days');
    const href = this.resetUrl(token);
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
