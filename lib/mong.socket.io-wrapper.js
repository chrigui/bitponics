/**
 * Overrides buggy mong.socket.io behavior
 */

 var SocketMongoStore = require('mong.socket.io');


/**
 * Publishes a message.
 * Everything after 1. param will be published as a data.
 *
 * @param {String} event name.
 * @param {Mixed} any data.
 * @api public
 */
SocketMongoStore.prototype.publish = function(name, value) {
  var args = [].slice.call(arguments, 1);

  
  args = args.filter(function(arg){
  	// HACK: filter out the Express request object; returning JSON circular stringify errors
  	return !arg.sessionStore;
  })

  this._channel.publish({
    name: name,
    nodeId: this._nodeId,
    args: JSON.stringify(args)
  }, this._error);

  this.emit.apply(this, ['publish', name].concat(args));
  
  return this;
};

module.exports = SocketMongoStore;