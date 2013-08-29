var ejs = require('ejs'),
		moment = require('moment-timezone'),
		timezone = require('../lib/timezone-wrapper');

ejs.filters.fromNow = function(date, timezone) {
	return moment(date).fromNow();
};

ejs.filters.friendlyDate = function(date, timezone) {
	return moment(date).tz(timezone || "America/New_York").format("dddd, MMMM Do YYYY, h:mm a");
};

module.exports = ejs;