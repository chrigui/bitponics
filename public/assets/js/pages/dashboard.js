require([
    'angular',
    'domReady',
		'moment',
		'fe-be-utils',
		'view-models',
		'angularResource',
    'd3',
    
    'es5shim',
    'steps',
    'overlay'
    ],
function(angular, domReady, moment, feBeUtils, viewModels){
	'use strict';


	var dashboardApp = angular.module('bpn.apps.dashboard', ['ngResource']);

	
	dashboardApp.controller('bpn.controllers.dashboard.Main', 
		[
			'$scope', 
			'$filter',
			function($scope, $filter){
					
					// First, transform the data into viewModel-friendly formats
					bpn.pageData.controls.forEach(function(control){
						viewModels.initControlViewModel(control);
					});

					viewModels.initGrowPlanInstanceViewModel(bpn.pageData.growPlanInstance);

					// Raise sensorLog readings to be hashes keyed by sensor code
					bpn.pageData.latestSensorLogs.forEach(function(sensorLog){
						sensorLog.logs.forEach(function(log){
							sensorLog[log.sCode] = log.val;
						});
						// delete array to save memory, since we're not going to use it anymore
						delete sensorLog.logs;
					});

					$scope.getLatestSensorLogsByDate = function(sensorLogs, date){
						// since sensorLog array is in desc date order, decrement through the array,
						// stopping if we've found the date or if we've found a date less than date
						var dateMoment = moment(date),
								dateDiff;

						for (var i = sensorLogs.length; i--;){
							dateDiff = dateMoment.diff(sensorLogs[i].timestamp, 'days')
							if (dateDiff == 0){
								return sensorLogs[i]
							} else if (dateDiff > 0) {
								return undefined;
							}
						}
					};
					
					// Set up functions and watchers
					

					/**
					 * Based on activeDte, refresh the latest sensor logs & control actions
					 */
					$scope.refreshSensorsAndControls = function (){
						$scope.activeDate.latestSensorLogs = $scope.getLatestSensorLogsByDate($scope.latestSensorLogs, $scope.activeDate.date);
					};

					$scope.$watch('activeDate.date', function(){
						// get the day's GrowPlan Phase
						// get the day's GrowPlanInstance.phase.daySummary
						// If not today, clear out the activeDate.latestSensorLogs property to make the sensor values blank out. not going to get past day's sensorLogs just yet


						// POST-MVP : get the day's sensorLogs
						// POST-MVP : get the device-controlled actions for the day's phase, bind those
						// POST-MVP : get the sensors for the day's phase (union of device sensors and Phase's IdealRanges.sCode)
					});

					// Finally, set the scope models
					$scope.controls = bpn.pageData.controls;
					$scope.sensors = bpn.pageData.sensors;
					$scope.growPlanInstance = bpn.pageData.growPlanInstance;
					$scope.latestSensorLogs = bpn.pageData.latestSensorLogs;
					$scope.activeDate = {
						date : new Date(),
						daySummary : {},
						latestSensorLogs : {}
					};
					$scope.refreshSensorsAndControls();
			}
		]
	);


	dashboardApp.controller('bpn.controllers.dashboard.DayOverview', 
		[
			'$scope', 
			'$filter',
			function($scope, $filter){
				// TODO: Add functions to handle interactions on anything in the DayOverview sidebar (clicks to open sensor detail overlay)
			}
		]
	);


	dashboardApp.controller('bpn.controllers.dashboard.PhasesGraph', 
		[
			'$scope', 
			'$filter',
			function($scope, $filter){
				// TODO: Add functions to handle interactions on the phase graph. 

				// TODO : function to set $scope.activeDate (will be called based on clicks or mouseovers on sections of the phaseGraph). 
				// Since $scope is inherited from parent, this'll set Main controller's $scope.activeDate, 
				// which in turn will update the DayOverview sidebar
			}
		]
	);



	dashboardApp.controller('bpn.controllers.dashboard.Controls', 
		[
			'$scope', 
			'$filter',
			function($scope, $filter){
				// TODO: Add functions to handle interactions with control widgets. Launch control overlay.
			}
		]
	);

	
	dashboardApp.controller('bpn.controllers.dashboard.Notifications', 
		[
			'$scope', 
			'$filter',
			function($scope, $filter){
				
			}
		]
	);

	domReady(function(){
		angular.bootstrap( document, ['bpn.apps.dashboard']);
	});

});
