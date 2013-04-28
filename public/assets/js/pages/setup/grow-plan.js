require([
  'angular',
  'domReady',
  'view-models',
  'moment',
  'fe-be-utils',
  '/assets/js/services/grow-plan.js',
  'es5shim',
  'steps',
  'overlay'
],
  function (angular, domReady, viewModels, moment, feBeUtils) {
    'use strict';

    var growPlanApp = angular.module('bpn.apps.setup.growPlan', ['bpn.services']);

		growPlanApp.config(
			[
				'$locationProvider',
				'$routeProvider',
				function($locationProvider, $routeProvider) {
			    $locationProvider.html5Mode(true);
    			$locationProvider.hashPrefix = '!';

			    $routeProvider
			    	.when('/', {
			        controller: 'bpn.controllers.setup.growPlan.Filter',
			        templateUrl: 'filter.html'
			      })
			      .when('/browse', {
			        controller: 'bpn.controllers.setup.growPlan.Browse',
			        templateUrl: 'browse.html'
			      })
			      .when('/customize/:growPlanId', {
			        controller: 'bpn.controllers.setup.growPlan.CustomizeOverview',
			        resolve: {
			          growPlan: ['GrowPlanLoader', function(GrowPlanLoader) {
			            return GrowPlanLoader();
			          }]
			        },
			        templateUrl:'customize-overview.html'
			      })
			      .when('/customize/:growPlanId/details', {
			        controller: 'bpn.controllers.setup.growPlan.CustomizeDetails',
			        templateUrl:'customize-details.html'
			      })
			      .otherwise({redirectTo:'/'}
	      	);
				}
			]
		);


		growPlanApp.factory('GrowPlanLoader', 
			[
				'GrowPlanModel', 
				'$route', 
				'$q',
		    function(GrowPlanModel, $route, $q) {
		  		return function() {
		    		var delay = $q.defer();
		    		console.log('growPlanLoader doin its thing', $route.current.params.growPlanId)
		    		GrowPlanModel.get( { id : $route.current.params.growPlanId }, 
		    			function (growPlan) {
		    				viewModels.initGrowPlanViewModel(growPlan);
		      			delay.resolve(growPlan);
		    			}, 
		    			function() {
		      			delay.reject('Unable to fetch grow plan '  + $route.current.params.growPlanId );
		    			}
	    			);
		    		return delay.promise;
		  		};
				}
			]
		);

    growPlanApp.controller('bpn.controllers.setup.growPlan.Filter',
    	[
    		'$scope',
    		function($scope){

    		}
    	]
  	);

    growPlanApp.controller('bpn.controllers.setup.growPlan.Browse',
    	[
    		'$scope',
    		function($scope){

    		}
    	]
  	);

  	growPlanApp.controller('bpn.controllers.setup.growPlan.CustomizeOverview',
    	[
    		'$scope',
    		'growPlan',
    		function($scope, growPlan){
    			$scope.selected.growPlan = growPlan;
					
          $scope.updateSelectedGrowPlanPlants(true);
        }
    	]
  	);

  	growPlanApp.controller('bpn.controllers.setup.growPlan.CustomizeDetails',
    	[
    		'$scope',
    		function($scope){
    			console.log("in details", $scope.selectedGrowPlan);

    			$scope.init = function(){
    				//$scope.expectedGrowPlanDuration = $scope.selected.growPlan.phases.reduce(function (prev, cur) { return prev.expectedNumberOfDays + cur.expectedNumberOfDays;});
  					$scope.setExpectedGrowPlanDuration();
          	$scope.setCurrentPhaseTab(0);
  				};

    			$scope.setExpectedGrowPlanDuration = function () {
            var currentExpectedPlanDuration = 0;
            $scope.selected.growPlan.phases.forEach(function (phase) {
              currentExpectedPlanDuration += phase.expectedNumberOfDays;
            });
            $scope.expectedGrowPlanDuration = currentExpectedPlanDuration;
          };

          $scope.setCurrentPhaseTab = function (index) {
            $scope.selected.selectedGrowPlanPhase = index;
          };

          $scope.setCurrentPhaseSectionTab = function (index) {
            $scope.selected.selectedGrowPlanPhaseSection = index;
          };

          $scope.addPhase = function () {
            var existingPhaseLength = $scope.selected.growPlan.phases.length,
              phase = {
                _id:existingPhaseLength.toString() + '-' + (Date.now().toString()), // this is just to make it unique in the UI. The server will detect that this is not an ObjectId and create a new IdealRange
                actionsViewModel:[],
                idealRanges:[]
              };
            $scope.selected.growPlan.phases.push(phase);
            $scope.setCurrentPhaseTab(existingPhaseLength);
          };

          $scope.removePhase = function (index) {
            $scope.selected.growPlan.phases.splice(index, 1);
            $scope.setCurrentPhaseTab(0);
          };

          $scope.addIdealRange = function (e) {
            var phase = e.phase,
              newIdealRange = {
                _id:phase.idealRanges.length.toString() + '-' + (Date.now().toString()), // this is just to make it unique in the UI. The server will detect that this is not an ObjectId and create a new IdealRange
                valueRange:{
                  min:0,
                  max:1
                }
              };
            // Unshift to make it show up first
            phase.idealRanges.unshift(newIdealRange);
          };

          $scope.addAction = function (e) {
            var phase = e.phase,
              newAction = {
                _id:phase.actions.length.toString() + '-' + (Date.now().toString()) // this is just to make it unique in the UI. The server will detect that this is not an ObjectId and create a new Action
              };
            // Unshift to make it show up first
            phase.actions.unshift(newAction);
          };

          $scope.removeIdealRange = function (phaseIndex, idealRangeIndex) {
            $scope.selected.growPlan.phases[phaseIndex].idealRanges.splice(idealRangeIndex, 1);
          };

          $scope.removeAction = function (phaseIndex, actionIndex) {
            $scope.selected.growPlan.phases[phaseIndex].actions.splice(actionIndex, 1);
          };

    			$scope.init();
        }
    	]
  	);


    growPlanApp.controller('bpn.controllers.setup.growPlan.Main',
      [
        '$scope',
        '$filter',
        'GrowPlanModel',
        function ($scope, $filter, GrowPlanModel) {
          $scope.plants = bpn.plants;
          $scope.lights = bpn.lights;
          $scope.lightFixtures = bpn.lightFixtures;
          $scope.lightBulbs = bpn.lightBulbs;
          $scope.nutrients = bpn.nutrients;
          $scope.filteredPlantList = angular.copy($scope.plants);
          $scope.controls = bpn.controls;
          $scope.sensors = bpn.sensors;
          $scope.userOwnedDevices = bpn.userOwnedDevices;
          $scope.plantSelections = {};
          $scope.selectedPlants = [];
          $scope.plantQuery = '';
          $scope.growSystems = bpn.growSystems;
          //$scope.selectedGrowPlan = {}; 
          $scope.selectedGrowSystem = undefined;
          $scope.currentGrowPlanDay = 0;
          $scope.growPlans = bpn.growPlans;
          $scope.filteredGrowPlanList = angular.copy($scope.growPlans);
          $scope.timesOfDayList = feBeUtils.generateTimesOfDayArray();
          $scope.actionDurationTypeOptions = feBeUtils.DURATION_TYPES;
          $scope.actionWithNoAccessoryDurationTypeOptions = ['days', 'weeks', 'months'];
          $scope.overlayItems = []; //used by Overlay Ctrl
          $scope.overlayMetaData = {}; //pass additional config to overlay
          $scope.overlayStates = { //manage open state
            'plant':false,
            'fixture':false,
            'growSystemOverlay':false,
            'growMediumOverlay':false,
            'nutrient':false
          }
          $scope.growPlanPhaseSectionUITabs = ['Grow System', 'Light', 'Sensor Ranges', 'Actions'];
          // $scope.UI.suggestions = {
          //     lightFixtures: bpn.utils.suggestions.lightFixtures,
          //     lightBulbs: bpn.utils.suggestions.lightTypes
          // }

          if ($scope.userOwnedDevices.length > 0) {
            $scope.growPlanPhaseSectionUITabs.push('Device')
          }

          //Wrapping our ng-model vars {}
          //This is necessary so ng-change always fires, due to: https://github.com/angular/angular.js/issues/1100
          $scope.selected = {
            // growSystem: undefined,
            growPlan : undefined,
            plant:{},
            selectedGrowPlanPhase:0,
            selectedGrowPlanPhaseSection:0,
            selectedDevice:undefined,
            lightFixture:undefined,
            lightBulb:undefined,
            growMedium:undefined,
            nutrient:{}
          };

          $scope.selectedSensors = function () {
            var list = [];
            angular.forEach($scope.sensors, function (sensor) {
              list.push(sensor);
            });
            return list;
          };

          $scope.updateSelectedGrowSystem = function () {
            // $scope.selectedGrowSystem = $filter('filter')($scope.growSystems, { _id: $scope.selected.growSystem })[0];
            if ($scope.selectedPlants && $scope.selectedPlants.length) {
              $scope.updatefilteredGrowPlans();
            }
          };

          $scope.addPlant = function (obj) {
            var newPlant = {_id:obj.query || $scope.query, name:obj.query || $scope.query };
            $scope.filteredPlantList.push(newPlant);
            $scope.selectedPlants.push(newPlant);
            $scope.selected.plant[newPlant._id] = true;
            $scope.query = "";
            $scope.$$childHead.query = "";
            $scope.$$childHead.search();
            obj.query = "";
          };

          // $scope.updateSelectedPlants = function(){
          //     $scope.selectedPlants = [];
          //     for (var i = $scope.plants.length; i--;) {
          //         Object.keys($scope.selected.plant).forEach(function(_id) {
          //             if ($scope.selected.plant[_id] && $scope.plants[i]._id == _id) {
          //                 $scope.selectedPlants.push($scope.plants[i]);
          //             }
          //         });
          //     }

          //     $scope.updateSelectedGrowPlanPlants();

          //     if($scope.selectedGrowSystem){
          //         $scope.updatefilteredGrowPlans();
          //     }
          // };

          $scope.updateSelected = {

            'plants':function () {
              $scope.selectedPlants = [];
              for (var i = $scope.plants.length; i--;) {
                Object.keys($scope.selected.plant).forEach(function (_id) {
                  if ($scope.selected.plant[_id] && $scope.plants[i]._id == _id) {
                    $scope.selectedPlants.push($scope.plants[i]);
                  }
                });
              }

              $scope.updateSelectedGrowPlanPlants();

              if ($scope.selectedGrowSystem) {
                $scope.updatefilteredGrowPlans();
              }
            },

            'lightFixture':function (data, phase) {
              $scope.selected.growPlan.phases[$scope.selected.selectedGrowPlanPhaseSection].light.fixture = data.item;
            },

            'lightBulb':function (data, phase) {
              $scope.selected.growPlan.phases[$scope.selected.selectedGrowPlanPhaseSection].light.bulb = data.item;
            },

            'growSystem':function (data, phase) {
              $scope.selected.growPlan.phases[$scope.selected.selectedGrowPlanPhaseSection].growSystem = data.item;
            },

            'growMedium':function (data, phase) {
              console.log('growMedium')
            },

            'nutrients':function (data, phase) {
              var nutrients = [];
              for (var i = $scope.nutrients.length; i--;) {
                Object.keys($scope.selected.nutrient[phase]).forEach(function (_id) {
                  if ($scope.selected.nutrient[phase][_id] && $scope.nutrients[i]._id == _id) {
                    nutrients.push($scope.nutrients[i]);
                  }
                });
              }
              $scope.selected.growPlan.phases[$scope.selected.selectedGrowPlanPhaseSection].nutrients = nutrients;
            }

          };

          $scope.updateSelectedGrowPlanPlants = function (initial) {
            //add any selected plants that arent in grow plan, only once when grow plan requested
            if (initial) {
              $scope.selectedPlants.forEach(function (plant, index) {
                if (0 === $.grep($scope.selected.growPlan.plants,function (gpPlant) { return gpPlant.name == plant.name; }).length) {
                  //only add if not already in grow plan's plant list
                  $scope.selected.growPlan.plants.push(plant);
                }
              });
              //also set any grow plan plants selected
              $scope.selected.growPlan.plants.forEach(function (plant, index) {
                $scope.selected.plant[plant._id] = true;
              });
            } else if (typeof $scope.selectedGrowPlan != 'undefined') {
              //else just add selected to grow plan plant list if its already defined (meaning we already requested it)
              $scope.selected.growPlan.plants = $scope.selectedPlants;
              $scope.selected.growPlan.plants.sort(function (a, b) { return a.name < b.name; });
            }
          };

          $scope.updatefilteredGrowPlans = function () {
            var selectedPlantIds = $scope.selectedPlants.map(function (plant) { return plant._id }),
              growPlanDefault = new GrowPlanModel(bpn.growPlanDefault);

            //hit API with params to filter grow plans
            $scope.filteredGrowPlanList = GrowPlanModel.query({
              plants:selectedPlantIds,
              growSystem:$scope.selectedGrowSystem
              // growSystem: $scope.selectedGrowSystem._id
            }, function () {
              //add default to end of filtered grow plan array
              $scope.filteredGrowPlanList.splice($scope.filteredGrowPlanList.length, 0, growPlanDefault);
            });
          };

          

          $scope.toggleOverlay = function (overlayMetaData) {
            $scope.overlayMetaData = overlayMetaData;
            switch (overlayMetaData.type) {
              case 'plant':
                $scope.overlayItems = $scope.filteredPlantList;
                // $scope.overlayItemKey = "plants";
                break;
              case 'fixture':
                $scope.overlayItems = $scope.lightFixtures;
                // $scope.overlayItemKey = "lightFixture";
                break;
              case 'bulb':
                $scope.overlayItems = $scope.lightBulbs;
                // $scope.overlayItemKey = "lightBulb";
                break;
              case 'growSystem':
                $scope.overlayItems = $scope.growSystems;
                // $scope.overlayItemKey = "growSystem";
                break;
              case 'nutrient':
                $scope.overlayItems = $scope.nutrients;
                // $scope.overlayItemKey = "nutrients";
                break;
              default:
                $scope.overlayItems = [];
                // $scope.overlayItemKey = '';
                break;
            }
            if ($scope.overlayStates[$scope.overlayMetaData.type]) {
              $scope.overlayItems = [];
              $scope.overlayStates[$scope.overlayMetaData.type] = false;
            } else {
              // $scope.$broadcast('newOverlay', [itemKey, $scope.overlayItems]);
              $scope.$broadcast('newOverlay');
              $scope.overlayStates[$scope.overlayMetaData.type] = true;
            }
          };

          $scope.submit = function (e) {
            //e.preventDefault();

            if ($scope.selectedGrowPlan) {
              var dataToSubmit = {
                submittedGrowPlan:viewModels.compileGrowPlanViewModelToServerModel($scope.selectedGrowPlan),
                growPlanInstance:{
                  currentGrowPlanDay:1 // TODO
                },
                deviceId:"" // TODO
              };

              console.log(dataToSubmit);

              // TODO : show spinner
              $.ajax({
                url:'/setup/grow-plan',
                type:'POST',
                contentType:'application/json; charset=utf-8',
                dataType:'json',
                data:JSON.stringify(dataToSubmit),
                processData:false,
                success:function (data) {
                  console.log(data);
                  // TODO : Show message, take user to /dashboard
                },
                error:function (jqXHR, textStatus, error) {
                  console.log('error', jqXHR, textStatus, error);
                  // TODO : show an error message
                }
              });
            }
          };
        }
      ]
    );
  	
  	domReady(function () {
      angular.bootstrap(document, ['bpn.apps.setup.growPlan']);
    });
  }
);