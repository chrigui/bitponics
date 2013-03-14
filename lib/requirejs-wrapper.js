var requirejs = require('requirejs');

requirejs.config({
	nodeRequire: require,
	baseUrl : 'public/assets/js/fe-be'
});

module.exports = requirejs;