var ejs = require('ejs'),
		moment = require('moment'),
		timezone = require('../lib/timezone-wrapper');

ejs.filters.fromNow = function(date, timezone) {
	return moment(date).fromNow();
};

ejs.filters.friendlyDate = function(date, timezone) {
	return moment(date).format("dddd, MMMM Do YYYY, h:mm a"); ;
	//return timezone(date, timezone, '%A, %B %-d, %Y %-I:%M:%S %p');
};

module.exports = ejs;