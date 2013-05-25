define([
	'bpn.services',
	'socket.io'
	], 
	function (bpnServices, io) {
		'use strict';

		return bpnServices.factory('bpn.services.socket', function ($rootScope) {
		  var socket;


		  return {
		  	connect : function(path){
		  		socket = io.connect(path);
		  	},
		  	disconnect : function(){
		  		if (socket){
		  			socket.disconnect();	
		  		}
		  	},
		    on: function (eventName, callback) {
		      socket.on(eventName, function () {
		        var args = arguments;
		        $rootScope.$apply(function () {
		          callback.apply(socket, args);
		        });
		      });
		    },
		    emit: function (eventName, data, callback) {
		      socket.emit(eventName, data, function () {
		        var args = arguments;
		        $rootScope.$apply(function () {
		          if (callback) {
		            callback.apply(socket, args);
		          }
		        });
		      })
		    }
		  };
		});
	}
);
