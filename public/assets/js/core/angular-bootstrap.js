define(['angular', 'domReady', 'bpnApp'], 
	function(angular, domReady) { 
		'use strict';
		domReady(function(){
			angular.bootstrap( document, ['bpnApp']); 	
		});
	}
);
