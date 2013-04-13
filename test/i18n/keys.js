


/**
 * Mocha Test
 *
 * Tests are organized by having a "describe" and "it" method. Describe
 * basically creates a "section" that you are testing and the "it" method
 * is what runs your test code.
 *
 * For asynchronous tests you need to have a done method that you call after
 * your code should be done executing so Mocha runs to test properly.
 */
describe('i18n keys', function(){
	var User = require('../../models/user').model,
	should = require('should'),
	i18nKeys = require('../../i18n/keys');
	
  describe('get', function(){
    it('returns an error string if an invalid key is provided', function(){
      var expected = "Invalid i18n key",
        key = "something that is not a key in i18n keys";
        i18nKeys.get(key).should.equal(expected);  
    });

    it('returns the requested string', function(){
      var expected = "An action with a control must define a cycle with 1 or more control states",
        key = "An action with a control must define a cycle with 1 or more control states";
        i18nKeys.get(key).should.equal(expected);  
    });

    it('returns the requested string, populated with the provided arguments', function(){
      var immediateActionMessage = "action triggered by something",
        actionDescription = "actionDescription",
        expected = "action triggered by something. Your device has automatically handled the following action : actionDescription.",
        key = "device action trigger message";
        i18nKeys.get(key, immediateActionMessage, actionDescription).should.equal(expected);  
    });
  });
});