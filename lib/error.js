/** 
 * http://dustinsenos.com/articles/customErrorsInNode
 */
var util = require('util')

var AbstractError = function (msg, constr) {
  Error.captureStackTrace(this, constr || this)
  this.message = msg || 'Error'
}
util.inherits(AbstractError, Error)
AbstractError.prototype.name = 'Abstract Error'

var customErrors = ["BraintreeError", "ValidationError"];

// Initialize basic error classes based on AbstractError
customErrors.forEach(function (errorName) {
  var errorFn = exports[errorName] = function (msg) {
    errorFn.super_.call(this, msg, this.constructor);
  };
  util.inherits(errorFn, AbstractError);
  errorFn.prototype.name = errorName;
});


// At this point, we can add custom properties to the above error classes

// TODO:  Maybe ValidationError should have an array of errors, like http://mongoosejs.com/docs/validation.html