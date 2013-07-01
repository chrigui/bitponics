var ejs = require('ejs');

ejs.filters.fromNow = function(date, timezone) {
	moment = require('moment');
  return moment(date).fromNow();
};

module.exports = ejs;