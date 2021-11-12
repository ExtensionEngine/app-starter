import AudienceScope, { Audience } from './audience';
import { AuthCallback, SecretOrKeyCallback, TokenPayload } from './types';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, RequestHandler } from 'express';
import { AuthConfig } from '../config/auth';
import autobind from 'auto-bind';
import bcrypt from 'bcrypt';
import { Config } from '../config';
import IAuthService from './interfaces/service';
import IUserRepository from '../user/interfaces/repository';
import LocalStrategy from 'passport-local';
import passport from 'passport';
import User from '../user/model';

class AuthService implements IAuthService {
  #config: AuthConfig;
  #userRepository: IUserRepository;

  constructor(config: Config, userRepository: IUserRepository) {
    this.#userRepository = userRepository;
    this.#config = config.auth;
    autobind(this);

    passport.use('jwt', new JwtStrategy({
      ...this.#config.jwt,
      audience: AudienceScope.Access,
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme(this.#config.jwt.scheme),
      secretOrKey: this.#config.jwt.secret
    }, this.verifyJWT));

    passport.use('token', new JwtStrategy({
      ...this.#config.jwt,
      audience: AudienceScope.Setup,
      jwtFromRequest: ExtractJwt.fromBodyField('token'),
      secretOrKeyProvider: this.secretOrKeyProvider
    }, this.verifyJWT));

    passport.use('local', new LocalStrategy({
      usernameField: 'email',
      session: false
    }, this.verifyLocal));

    passport.serializeUser((user: User, done: AuthCallback) => done(null, user));
    passport.deserializeUser((user: User, done: AuthCallback) => done(null, user));
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

  setRequestContext(...params: Parameters<RequestHandler>): void {
    return passport.initialize()(...params);
  }

  private getTokenSecret({ id, updatedAt }: User, audience?: Audience) : string {
    const { secret } = this.#config.jwt;
    if (audience === AudienceScope.Access) return secret;
    return [secret, id, updatedAt.getTime()].join('');
  }

  private verifyJWT({ id }: TokenPayload, done: AuthCallback): Promise<void> {
    return this.#userRepository.findOne(id)
      .then(user => done(null, user))
      .catch(err => done(err, null));
  }

  private verifyLocal(
    email: string,
    password: string,
    done: AuthCallback
  ): Promise<void> {
    return this.#userRepository.findOne({ email })
      .then(user => user && this.authenticate(user, password))
      .then(user => done(null, user))
      .catch(err => done(err, null));
  }

  private async secretOrKeyProvider(
    _req: Request,
    rawToken: string,
    done: SecretOrKeyCallback
  ): Promise<void> {
    const payload = jwt.decode(rawToken) as JwtPayload;
    return this.#userRepository.findOne(payload?.id)
      .then(user => this.getTokenSecret(user))
      .then(secret => done(null, secret))
      .catch(err => done(err, null));
  }
}

export default AuthService;
