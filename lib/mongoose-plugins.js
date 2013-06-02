var mongoose = require('mongoose'),
  requirejs = require('../lib/requirejs-wrapper'),
  feBeUtils = requirejs('fe-be-utils');

module.exports = {
  useTimestamps : function (schema, options) {
    schema.add({
        createdAt: Date
      , updatedAt: Date
    });
    schema.pre('save', function (next) {
      if (!this.createdAt) {
        this.createdAt = this.updatedAt = new Date;
      } else {
        this.updatedAt = new Date;
      }
      next();
    });
  },

  visibility : function (schema, options){
    options = options || {};

    schema.add({
      visibility : { 
        type: String, 
        enum: [
          feBeUtils.VISIBILITY_OPTIONS.PUBLIC,
          feBeUtils.VISIBILITY_OPTIONS.PRIVATE
        ], 
        default : options.default || feBeUtils.VISIBILITY_OPTIONS.PUBLIC
      }
    });
  }
};