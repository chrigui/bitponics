var tz = require('timezone/loaded');

module.exports = function(){
	var args = Array.prototype.slice.call(arguments);
	args.forEach(function(arg, index){
		if (typeof arg === 'string' && arg.indexOf('week') > 0){
			var argParts = arg.split(' '),
					operation = argParts[0][0],
					number = argParts[0].substr(1);
			args[index] = operation + (parseInt(number) * 7).toString() + " days";
		}
	})
	return tz.apply(null, args);
};