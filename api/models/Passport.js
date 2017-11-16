var bcrypt = require('bcryptjs');

/**
 * Hash a passport password.
 *
 * @param {Object}   password
 * @param {Function} next
 */
function hashPassword (passport, next) {
  if (passport.password) {
    bcrypt.hash(passport.password, 10, function (err, hash) {
      passport.password = hash;
      next(err, passport);
    });
  } else {
    next(null, passport);
  }
}

/**
 * Passport Model
 *
 * The Passport model handles associating authenticators with users. An authen-
 * ticator can be either local (password) or third-party (provider). A single
 * user can have multiple passports, allowing them to connect and use several
 * third-party strategies in optional conjunction with a password.
 *
 * Since an application will only need to authenticate a user once per session,
 * it makes sense to encapsulate the data specific to the authentication process
 * in a model of its own. This allows us to keep the session itself as light-
 * weight as possible as the application only needs to serialize and deserialize
 * the user, but not the authentication data, to and from the session.
 */
var Passport = {
  attributes: {
    protocol: { type: 'string', required: true },
    password    : { type: 'string', minLength: 8 },
    accessToken : { type: 'string' },
    provider   : { type: 'string' },
    identifier : { type: 'string' },
    tokens     : { type: 'json' },
    user: { model: 'User', required: true }
  }
};

module.exports = Passport;
