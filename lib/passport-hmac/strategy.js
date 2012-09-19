/**
 * Module dependencies.
 */
var passport = require('passport')
  , uri = require('url')
  , crypto = require('crypto')
  , util = require('util')
  , winston = require('winston');


function Strategy(options) {
  if (!options.getUser) throw new Error('HMAC authentication strategy requires a getUser function');
  
  passport.Strategy.call(this);
  this.name = options.name || 'hmac';
  this.scheme = options.scheme || 'HMAC';
  this._getUser = options.getUser;
  this._realm = 'Users';
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on the contents of a HTTP Authorization
 * header
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req) {
  var self = this,
      parts,
      credentials,
      scheme,
      authHeader = req.headers['authorization'],
      publicKey,
      hmacSignature;

  winston.info('REQUEST HEADERS: ' + JSON.stringify(req.headers));
      
  if (!authHeader) {
    return this.fail(400);
  }

  parts = authHeader.split(' ');
  scheme = parts[0];
  credentials = parts[1].split(':');
  
  
  if (!scheme.toLowerCase() === this.scheme.toLowerCase()) {
    return this.fail(400)
  } 
  

  if (!credentials.length === 2) {
    return this.fail(this._challenge());
  }

  publicKey = credentials[0];
  hmacSignature = credentials[1];

  this._getUser(publicKey, function(err, user, privateKey) {
    var hmac,
        hmacSource,
        computedSignature;

    if (err) { return self.error(err); }
    if (!user) { return self.fail(self._challenge('bpn_access_token_rejected')); }

    hmac = crypto.createHmac('sha256', privateKey)

    winston.info('HMAC COMPARISON HAPPENING NOW');
    winston.info(req.method + ' ' + req.url + ' HTTP/' + req.httpVersion + req.rawBody);

    hmacSource = req.method + ' ' + req.url + ' HTTP/' + req.httpVersion + req.rawBody;
    
    computedSignature = hmac.update(hmacSource).digest('hex');
    winston.info('HMAC PRIVATE KEY ' + privateKey);
    winston.info('HMAC PROVIDED SIGNATURE ' + hmacSignature);
    winston.info('HMAC COMPUTED SIGNATURE ' + computedSignature);
    if (hmacSignature !== computedSignature) {
      return self.fail(self._challenge('signature_invalid'));
    }

    return self.success(user);

  });
}

/**
 * Authentication challenge.
 *
 * References:
 *  - [Problem Reporting](http://wiki.oauth.net/w/page/12238543/ProblemReporting)
 *
 * @api private
 */
Strategy.prototype._challenge = function(problem, advice) {
  var challenge = this.scheme;
  if (problem) {
    challenge += ', hmac_problem="' + encodeURIComponent(problem) + '"';
  }
  if (advice && advice.length) {
    challenge += ', hmac_problem_advice="' + encodeURIComponent(advice) + '"';
  }

  return challenge;
}


module.exports = Strategy;