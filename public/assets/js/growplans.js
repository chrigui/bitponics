define([
    'view-models',
    'es5shim',
    'steps',
    'moment',
    'fe-be-utils',
    'overlay'
    ],
function(viewModels){
    bpn.pages.growplans = {
        init: function() {
            // https://github.com/jrburke/requirejs/issues/507
            // http://www.youtube.com/watch?v=ZhfUv0spHCY&feature=player_profilepage#t=456s
            angular.bootstrap(document, ["GrowPlanModule"]);

            //custom dropdown
            // $('.dropdown').on('click', function(e){
            //     var dd = $(this);
            //     dd.toggleClass('open').removeClass('initial');
                
            //     $(dd.filter('.open'))
            //         .off('click.dropdown')
            //         .on('click.dropdown', 'label', labelClick);

            //     function labelClick(e){
            //         var option = $(this),
            //             dd = option.parents('.dropdown');
            //         // option.closest('.select').remove();
            //         dd.toggleClass('open');
            //     }
            // });


        },

        app: angular.module( "GrowPlanModule", [ "ngResource" ] ),

        GrowPlanController : ['$scope', '$filter', '$resource', function($scope, $filter, $resource){
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
            $scope.growSystemSelections = {};
            $scope.currentGrowPlanDay = 0;
            $scope.growPlans = bpn.growPlans;
            $scope.filteredGrowPlanList = angular.copy($scope.growPlans);
            $scope.timesOfDayList = bpn.utils.generateTimesOfDayArray();
            $scope.actionDurationTypeOptions = bpn.utils.DURATION_TYPES,
            $scope.actionWithNoAccessoryDurationTypeOptions = ['days','weeks','months'];
            $scope.showPlantOverlay = false;
            $scope.showFixtureOverlay = false;
            $scope.showGrowSystemOverlay = false;
            $scope.showGrowMediumOverlay = false;
            $scope.showNutrientOverlay = false;
            $scope.overlayItems = [];
            $scope.growPlanPhaseSectionUITabs = ['Grow System','Light','Sensor Ranges','Actions'];
            // $scope.UI.suggestions = {
            //     lightFixtures: bpn.utils.suggestions.lightFixtures,
            //     lightBulbs: bpn.utils.suggestions.lightTypes
            // }

            if($scope.userOwnedDevices.length > 0){
                $scope.growPlanPhaseSectionUITabs.push('Device')
            }

            //Wrapping our ng-model vars {}
            //This is necessary so ng-change always fires, due to: https://github.com/angular/angular.js/issues/1100
            $scope.selected = {
                growSystem: undefined,
                growPlan: undefined,
                plant: {},
                selectedGrowPlanPhase: 0,
                selectedGrowPlanPhaseSection: 0,
                selectedDevice: undefined,
                lightFixture: undefined,
                lightBulb: undefined,
                growMedium: undefined,
                nutrients: undefined
            };

            var GrowPlanModel = $resource(
                '/api/grow_plans/',
                {},
                {
                    'query':  { method: 'GET', isArray: true }
                }
            );
        
            
            $scope.setSelectedGrowPlan = function() {
                $scope.selectedGrowPlan = $filter('filter')($scope.growPlans, { _id: $scope.selected.growPlan })[0];

                if (!$scope.selectedGrowPlan) { 
                    $scope.selectedGrowPlan = bpn.growPlanDefault;
                }
                
                $scope.selectedGrowPlan = GrowPlanModel.get({
                    id: $scope.selectedGrowPlan._id
                }, function(){
                    viewModels.initGrowPlanViewModel($scope.selectedGrowPlan);

                    // Update grow plan plants.
                    $scope.updateSelectedGrowPlanPlants(true);
                    
                    $scope.expectedGrowPlanDuration = $scope.selectedGrowPlan.phases.reduce(function(prev, cur){ return prev.expectedNumberOfDays + cur.expectedNumberOfDays;});
                });

                if(Steps){
                    Steps.validate();
                }

            };

            $scope.selectedSensors = function() {
                var list = [];
                angular.forEach($scope.sensors, function(sensor) {
                  list.push(sensor);
                });
                return list;
            };

            $scope.updateSelectedGrowSystem = function(){
                $scope.selectedGrowSystem = $filter('filter')($scope.growSystems, { _id: $scope.selected.growSystem })[0];
                if($scope.selectedPlants && $scope.selectedPlants.length){
                    $scope.updatefilteredGrowPlans();
                }
            };

            $scope.addPlant = function(obj){
                var newPlant = {_id: obj.query || $scope.query, name : obj.query || $scope.query };
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

                'plants': function(){
                    $scope.selectedPlants = [];
                    for (var i = $scope.plants.length; i--;) {
                        Object.keys($scope.selected.plant).forEach(function(_id) {
                            if ($scope.selected.plant[_id] && $scope.plants[i]._id == _id) {
                                $scope.selectedPlants.push($scope.plants[i]);
                            }
                        });
                    }

                    $scope.updateSelectedGrowPlanPlants();

                    if($scope.selectedGrowSystem){
                        $scope.updatefilteredGrowPlans();
                    }
                },

                'lightFixtures': function(){
                    console.log('lightFixture')
                },

                'lightBulbs': function(){
                    console.log('lightBulb')
                },

                'growSystem': function(gs){
                    console.log('growSystem: '+gs)
                },

                'growMedium': function(){
                    console.log('growMedium')
                },

                'nutrients': function(){
                    console.log('nutrients')
                }

            };

            $scope.updateSelectedGrowPlanPlants = function(initial){
                //add any selected plants that arent in grow plan, only once when grow plan requested
                if(initial){
                    $scope.selectedPlants.forEach(function(plant, index){
                        if (0 === $.grep($scope.selectedGrowPlan.plants, function(gpPlant){ return gpPlant.name == plant.name; }).length){
                            //only add if not already in grow plan's plant list
                            $scope.selectedGrowPlan.plants.push(plant);
                        }
                    });
                    //also set any grow plan plants selected
                    $scope.selectedGrowPlan.plants.forEach(function(plant, index){
                        $scope.selected.plant[plant._id] = true;
                    });
                }else if(typeof $scope.selectedGrowPlan != 'undefined'){
                    //else just add selected to grow plan plant list if its already defined (meaning we already requested it)
                    $scope.selectedGrowPlan.plants = $scope.selectedPlants;
                    $scope.selectedGrowPlan.plants.sort(function(a, b) { return a.name < b.name; });
                }
            };

            $scope.updatefilteredGrowPlans = function(){
                var selectedPlantIds = $scope.selectedPlants.map(function(plant) { return plant._id }),
                    growPlanDefault = new GrowPlanModel(bpn.growPlanDefault);

                //hit API with params to filter grow plans
                $scope.filteredGrowPlanList = GrowPlanModel.query({
                    plants: selectedPlantIds,
                    growSystem: $scope.selectedGrowSystem._id
                }, function(){
                    //add default to end of filtered grow plan array
                    $scope.filteredGrowPlanList.splice($scope.filteredGrowPlanList.length, 0, growPlanDefault);
                });
            };
            
            $scope.setExpectedGrowPlanDuration = function(){
                var currentExpectedPlanDuration = 0;
                $scope.selectedGrowPlan.phases.forEach(function(phase){
                    currentExpectedPlanDuration += phase.expectedNumberOfDays;
                });
                $scope.expectedGrowPlanDuration = currentExpectedPlanDuration;
            };

            $scope.setCurrentPhaseTab = function(index){
                $scope.selected.selectedGrowPlanPhase = index;
            };

            $scope.setCurrentPhaseSectionTab = function(index){
                $scope.selected.selectedGrowPlanPhaseSection = index;
            };

            $scope.addPhase = function(){
                var existingPhaseLength = $scope.selectedGrowPlan.phases.length,
                    phase = {
                        _id: existingPhaseLength.toString() + '-' + (Date.now().toString()), // this is just to make it unique in the UI. The server will detect that this is not an ObjectId and create a new IdealRange
                        actionsViewModel: [],
                        idealRanges: []
                    };
                $scope.selectedGrowPlan.phases.push(phase);
                $scope.setCurrentPhaseTab(existingPhaseLength);
            };

            $scope.removePhase = function(index){
                var existingPhaseLength = $scope.selectedGrowPlan.phases.length;
                $scope.selectedGrowPlan.phases.splice(index, 1);
                $scope.setCurrentPhaseTab(0);
            };

            $scope.addIdealRange = function(e){
                var phase = e.phase,
                    newIdealRange = {
                        _id : phase.idealRanges.length.toString() + '-' + (Date.now().toString()), // this is just to make it unique in the UI. The server will detect that this is not an ObjectId and create a new IdealRange
                        valueRange : {
                            min : 0,
                            max : 1
                        }
                    };
                // Unshift to make it show up first
                phase.idealRanges.unshift(newIdealRange);
            };

            $scope.addAction = function(e){
                var phase = e.phase,
                    newAction = {
                        _id : phase.actions.length.toString() + '-' + (Date.now().toString()) // this is just to make it unique in the UI. The server will detect that this is not an ObjectId and create a new Action
                    };
                // Unshift to make it show up first
                phase.actions.unshift(newAction);
            };

            $scope.toggleOverlay = function(overlayType, overlayModel){
                $scope.overlayModel = overlayModel;
                switch(overlayType){
                    case 'showPlantOverlay':
                        $scope.overlayItems = $scope.filteredPlantList;
                        $scope.overlayItemKey = "plants";
                        break;
                    case 'showFixtureOverlay':
                        $scope.overlayItems = $scope.lightFixtures;
                        $scope.overlayItemKey = "lightFixture";
                        break;
                    case 'showBulbOverlay':
                        $scope.overlayItems = $scope.lightBulbs;
                        $scope.overlayItemKey = "lightBulb";
                        break;
                    case 'showGrowSystemOverlay':
                        $scope.overlayItems = $scope.growSystems;
                        $scope.overlayItemKey = "growSystem";
                        break;
                    case 'showNutrientsOverlay':
                        $scope.overlayItems = $scope.nutrients;
                        $scope.overlayItemKey = "nutrients";
                        break;
                    default:
                        $scope.overlayItems = [];
                        $scope.overlayItemKey = '';
                        break;
                }
                if($scope[overlayType]){
                    $scope.overlayItems = [];
                    $scope.overlayItemKey = '';
                    $scope[overlayType] = false;
                }else{
                    // $scope.$broadcast('newOverlay', [itemKey, $scope.overlayItems]);
                    $scope.$broadcast('newOverlay');
                    $scope[overlayType] = true;
                }
            };

            $scope.submit = function(e){
                //e.preventDefault();

                if($scope.selectedGrowPlan){
                    var dataToSubmit = {
                      submittedGrowPlan : viewModels.compileGrowPlanViewModelToServerModel($scope.selectedGrowPlan),
                      growPlanInstance : {
                        currentGrowPlanDay : 1 // TODO
                      },
                      deviceId : "" // TODO
                    };
                    
                    console.log(dataToSubmit);
                    
                    // TODO : show spinner
                    $.ajax({
                      url: '/grow-plans',
                      type: 'POST',
                      contentType : 'application/json; charset=utf-8',
                      dataType: 'json',
                      data: JSON.stringify(dataToSubmit),
                      processData : false,
                      success: function(data){
                        console.log(data);
                        // TODO : Show message, take user to /dashboard
                      },
                      error: function(jqXHR, textStatus, error){
                        console.log('error', jqXHR, textStatus, error);
                        // TODO : show an error message
                      }
                    });
                }
            }
        }]
    };

    // bpn.pages.growplans.app.service('setOverlayData', function() {
    //     this.setData = function(itemArray) {
    //         return itemArray
    //     };
    // });

    // bpn.pages.growplans.app.directive('onFocus', function() {
    //     return {
    //         restrict: 'A',
    //         link: function(scope, elm, attrs) {
    //             console.log('onfocus');
    //             elm.bind('focus', function() {
    //                 scope.$apply(attrs.onFocus);
    //             });
    //         }
    //     };        
    // });

    // bpn.pages.growplans.app.directive('onBlur', function() {
    //     return {
    //         restrict: 'A',
    //         link: function(scope, elm, attrs) {
    //             elm.bind('blur', function() {
    //                 scope.$apply(attrs.onBlur);
    //             });
    //         }
    //     };        
    // });

    $(function () {
        bpn.pages.growplans.init();
    });

});