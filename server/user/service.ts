import Scope, { Audience } from '../shared/auth/audience';
import autobind from 'auto-bind';
import { Config } from '../config';
import { IContainer } from 'bottlejs';
import IMail from '../shared/mail/IMail';
import IUserService from './interfaces/service';
import jwt from 'jsonwebtoken';
import User from './model';

class UserService implements IUserService {
  #mail: IMail;
  #config: Config;

  constructor({ config, mail }: IContainer) {
    this.#mail = mail;
    this.#config = config;
    autobind(this);
  }

  private get serverConfig() {
    return this.#config.server;
  }

  private get authConfig() {
    return this.#config.auth;
  }

  private resetUrl(token) {
    return `${this.serverConfig.origin}/#/auth/reset-password/${token}`;
  }

  private getTokenSecret({ id, updatedAt }: User, audience: Audience) {
    const { secret } = this.authConfig;
    if (audience === Scope.Access) return secret;
    return [secret, id, updatedAt.getTime()].join('');
  }

  createToken(user: User, audience: Audience, expiresIn: string): string {
    const payload = { id: user.id, email: user.email };
    const options = {
      issuer: this.authConfig.issuer,
      audience: audience || Scope.Access,
      expiresIn
    };
    return jwt.sign(payload, this.getTokenSecret(user, audience), options);
  }

  async invite(user: User): Promise<User> {
    const token = this.createToken(user, Scope.Setup, '5 days');
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
    const token = this.createToken(user, Scope.Setup, '5 days');
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
