import AudienceScope from '../auth/audience';
import autobind from 'auto-bind';
import { Config } from '../config';
import IAuthService from '../auth/interfaces/service';
import IMail from '../shared/mail/IMail';
import IUserNotificationService from './interfaces/notification.service';
import User from '../user/model';

class UserNotificationService implements IUserNotificationService {
  #config: Config;
  #mail: IMail;
  #authService: IAuthService;

  constructor(config: Config, mail: IMail, authService: IAuthService) {
    this.#mail = mail;
    this.#config = config;
    this.#authService = authService;
    autobind(this);
  }

  async resetPassword(user: User): Promise<void> {
    const token = this.#authService.createToken(user, AudienceScope.Setup, '5 days');
    const href = this.resetUrl(token);
    const templateData = { href, recipientName: user.firstName };
    await this.#mail.send({
      to: user.email,
      subject: 'Reset password',
      templateName: 'reset',
      templateData
    });
  }

  async invite(user: User): Promise<void> {
    const token = this.#authService.createToken(user, AudienceScope.Setup, '5 days');
    const href = this.resetUrl(token);
    const recipient = user.email;
    const recipientName = user.firstName;
    const templateData = { href, recipientName };
    await this.#mail.send({
      to: recipient,
      subject: 'Invite',
      templateName: 'welcome',
      templateData
    });
  }

  private resetUrl(token: string): string {
    return `${this.#config.appUrl}/#/auth/reset-password/${token}`;
  }
}

export default UserNotificationService;