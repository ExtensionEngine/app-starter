'use strict';

const { ExtractJwt, Strategy: JwtStrategy } = require('passport-jwt');
const Audience = require('./audience');
const { Authenticator } = require('passport');
const autobind = require('auto-bind');
const { auth: config } = require('../../config');
const jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local');
const { User } = require('../database');

const auth = new (class extends Authenticator {
  constructor() {
    super();
    autobind(this);
  }

  authenticate(strategy, { failWithError = true, ...options } = {}) {
    // NOTE: Setup passport to forward errors down the middleware chain
    // https://github.com/jaredhanson/passport/blob/ad5fe1df/lib/middleware/authenticate.js#L171
    return super.authenticate(strategy, { ...options, failWithError });
  }
})();

const localOptions = {
  usernameField: 'email',
  session: false
};

const jwtOptions = {
  ...config,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme(config.scheme),
  secretOrKey: config.secret,
  audience: Audience.Scope.Access
};

auth.use(new LocalStrategy(localOptions, (email, password, done) => {
  return User.findOne({ where: { email } })
  .then(user => user && user.authenticate(password))
  .then(user => done(null, user || false))
  .catch(err => done(err, false));
}));

auth.use('token', new JwtStrategy({
  ...config.jwt,
  audience: Audience.Scope.Setup,
  jwtFromRequest: ExtractJwt.fromBodyField('token'),
  secretOrKeyProvider
}, verifyJWT));

auth.use('jwt', new JwtStrategy(jwtOptions, verifyJWT));

auth.serializeUser((user, done) => done(null, user));
auth.deserializeUser((user, done) => done(null, user));

module.exports = auth;

function verifyJWT(payload, done) {
  return User.findByPk(payload.id)
    .then(user => done(null, user || false))
    .catch(err => done(err, false));
}

function secretOrKeyProvider(_, rawToken, done) {
  const { id } = jwt.decode(rawToken) || {};
  return User.findByPk(id, { rejectOnEmpty: true })
    .then(user => user.getTokenSecret())
    .then(secret => done(null, secret))
    .catch(err => done(err));
}
