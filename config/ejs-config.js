var ejs = require('ejs');

ejs.filters.fromNow = function(date, timezone) {
	moment = require('moment');
  return moment(date).fromNow();
};

ejs.filters.friendlyDate = function(date, timezone) {
	moment = require('moment');
  return moment(date).format("dddd, MMMM Do YYYY, h:mm:ss a"); ;
};

module.exports = ejs;