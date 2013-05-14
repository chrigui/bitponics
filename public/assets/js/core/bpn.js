define([
	'angular',
	'angularResource',
	'controllers',
	'bpn.services',
	'directives'
	], 
	function (angular) {
		'use strict';

		return angular.module(
			'bpnApp', 
			['ngResource', 'controllers', 'bpn.services', 'directives']
		);
	}
);
