define([
	'angular',
	'angularResource',
	'controllers',
	'services',
	'directives'
	], 
	function (angular) {
		'use strict';

		return angular.module(
			'bpnApp', 
			['ngResource', 'controllers', 'services', 'directives']
		);
	}
);
