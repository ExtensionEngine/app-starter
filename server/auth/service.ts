import AudienceScope, { Audience } from './audience';
import { AuthConfig } from '../config/auth';
import autobind from 'auto-bind';
import bcrypt from 'bcrypt';
import IAuthService from './interfaces/service';
import { IContainer } from 'bottlejs';
import jwt from 'jsonwebtoken';
import User from '../user/model';
import { Config } from '../config';

class AuthService implements IAuthService {
  #config: AuthConfig;

  constructor(config: Config) {
    this.#config = config.auth;
    autobind(this);
  }

  getTokenSecret({ id, updatedAt }: User, audience?: Audience) : string {
    const { secret } = this.#config.jwt;
    if (audience === AudienceScope.Access) return secret;
    return [secret, id, updatedAt.getTime()].join('');
  }

  createToken(user: User, audience: Audience, expiresIn: string): string {
    const payload = { id: user.id, email: user.email };
    const options = { issuer: this.#config.jwt.issuer, audience, expiresIn };
    return jwt.sign(payload, this.getTokenSecret(user, audience), options);
  }

  async authenticate(user: User, password: string): Promise<boolean | User> {
    if (!user.password) return Promise.resolve(false);
    const match = await bcrypt.compare(password, user.password);
    return match && user;
  }
}

export default AuthService;
