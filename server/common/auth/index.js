'use strict';

const { ExtractJwt, Strategy: JwtStrategy } = require('passport-jwt');
const { Sequelize, User } = require('../database');
const { Authenticator } = require('passport');
const autobind = require('auto-bind');
const { auth: config } = require('../../config');
const LocalStrategy = require('passport-local');

const { EmptyResultError } = Sequelize;

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
  secretOrKey: config.secret
};

auth.use('local', new LocalStrategy(localOptions, (email, password, done) => {
  const where = { email };
  return User.findOne({ where, rejectOnEmpty: true })
    .then(user => user.authenticate(password))
    .then(user => done(null, user || false))
    .catch(EmptyResultError, () => done(null, false))
    .catch(err => done(err));
}));
auth.use('jwt', new JwtStrategy(jwtOptions, verify));

auth.serializeUser((user, done) => done(null, user));
auth.deserializeUser((user, done) => done(null, user));

module.exports = auth;

function verify(payload, done) {
  return User.findByPk(payload.id, { rejectOnEmpty: true })
    .then(user => done(null, user))
    .catch(EmptyResultError, () => done(null, false))
    .catch(err => done(err));
}
