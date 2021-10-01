import Scope, { Audience } from './audience';
import autobind from 'auto-bind';
import bcrypt from 'bcrypt';
import { Config } from '../config';
import IAuthService from './interfaces/service';
import { IContainer } from 'bottlejs';
import IMail from '../shared/mail/IMail';
import jwt from 'jsonwebtoken';
import User from '../user/model';

class AuthService implements IAuthService {
  #config: Config;
  #mail: IMail;

  constructor({ config, mail }: IContainer) {
    this.#mail = mail;
    this.#config = config;
    autobind(this);
  }

  private resetUrl(token) {
    return `${this.#config.server.origin}/#/auth/reset-password/${token}`;
  }

  getTokenSecret({ id, updatedAt }: User, audience?: Audience) : string {
    const { secret } = this.#config.auth.jwt;
    if (audience === Scope.Access) return secret;
    return [secret, id, updatedAt.getTime()].join('');
  }

  createToken(user: User, audience: Audience, expiresIn: string): string {
    const payload = { id: user.id, email: user.email };
    const options = {
      issuer: this.#config.auth.jwt.issuer,
      audience: audience,
      expiresIn
    };
    return jwt.sign(payload, this.getTokenSecret(user, audience), options);
  }

  async authenticate(user: User, password: string): Promise<boolean | User> {
    if (!user.password) return Promise.resolve(false);
    const match = await bcrypt.compare(password, user.password);
    return match && user;
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

  async invite(user: User): Promise<User> {
    const token = this.createToken(user, Scope.Setup, '5 days');
    const href = this.resetUrl(token);
    const { origin, hostname } = this.#config.server;
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
}

export default AuthService;
