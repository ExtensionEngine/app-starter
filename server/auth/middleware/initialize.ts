import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { NextFunction, Request, Response } from 'express';
import autobind from 'auto-bind';
import IAuthService from '../interfaces/service';
import { IContainer } from 'bottlejs';
import { IMiddleware } from '../../types/middleware';
import IUserRepository from '../../user/interfaces/repository';
import jwt from 'jsonwebtoken';
import LocalStrategy from 'passport-local';
import passport from 'passport';
import Scope from '../audience';
import User from '../../user/model';

const options = {
  usernameField: 'email',
  session: false
};

type TokenPayload = { id: number };
type AuthCallback = (error: Error | null, user: User | string | boolean) => void;

class Initialize implements IMiddleware {
  #userRepository: IUserRepository;
  #authService: IAuthService;

  constructor({ config, userRepository, authService }: IContainer) {
    this.#userRepository = userRepository;
    this.#authService = authService;
    autobind(this);

    const { auth } = config;

    passport.use('jwt', new JwtStrategy({
      ...auth.jwt,
      audience: Scope.Access,
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme(auth.jwt.scheme),
      secretOrKey: auth.jwt.secret
    }, this.verifyJWT));

    passport.use('token', new JwtStrategy({
      ...auth.jwt,
      audience: Scope.Setup,
      jwtFromRequest: ExtractJwt.fromBodyField('token'),
      secretOrKeyProvider: this.secretOrKeyProvider
    }, this.verifyJWT));

    passport.use('local', new LocalStrategy(options, this.verifyLocal));

    passport.serializeUser((user: User, done: AuthCallback) => done(null, user));
    passport.deserializeUser((user: User, done: AuthCallback) => done(null, user));
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
      .then(user => user && this.#authService.authenticate(user, password))
      .then(user => done(null, user))
      .catch(err => done(err, null));
  }

  private secretOrKeyProvider(
    _req: Request,
    rawToken: string,
    done: AuthCallback
  ): Promise<void> {
    const { payload } = jwt.decode(rawToken, { complete: true }) || {};
    return this.#userRepository.findOne(payload?.id)
      .then(user => this.#authService.getTokenSecret(user))
      .then(secret => done(null, secret))
      .catch(err => done(err, null));
  }

  handle(req: Request, res: Response, next: NextFunction): void {
    passport.initialize()(req, res, next);
  }
}
export default Initialize;
