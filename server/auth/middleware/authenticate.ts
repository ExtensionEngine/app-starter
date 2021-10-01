import passport from 'passport';
import { RequestHandler } from 'express';

export default authenticate;

function authenticate(strategy: string): RequestHandler {
  // NOTE: Setup passport to forward errors down the middleware chain
  // https://github.com/jaredhanson/passport/blob/ad5fe1df/lib/middleware/authenticate.js#L171
  return passport.authenticate(strategy, { failWithError: true });
}
