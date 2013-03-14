define([
    'view-models',
    'es5shim',
    'steps',
    'moment',
    'fe-be-utils'
    ],
function(viewModels){
    bpn.pages.growplans = {
        init: function() {
            // https://github.com/jrburke/requirejs/issues/507
            // http://www.youtube.com/watch?v=ZhfUv0spHCY&feature=player_profilepage#t=456s
            angular.bootstrap(document, ["GrowPlanModule"]);
        },

        app: angular.module( "GrowPlanModule", [ "ngResource" ] ),

        GrowPlanController : ['$scope', '$filter', '$resource', function($scope, $filter, $resource){
            $scope.plants = bpn.plants;
            $scope.filteredPlantList = angular.copy($scope.plants);
            $scope.controls = bpn.controls;
            $scope.sensors = bpn.sensors;
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

            //Wrapping our ng-model vars {}
            //This is necessary so ng-change always fires, due to: https://github.com/angular/angular.js/issues/1100
            $scope.selected = {
                growSystem: undefined,
                growPlan: undefined,
                plant: {}
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
                    $scope.selectedPlants.forEach(function(plant, index){
                        if (0 === $.grep($scope.selectedGrowPlan.plants, function(gpPlant){ return gpPlant.name == plant.name; }).length){
                            //only add if not already in grow plan's plant list
                            $scope.selectedGrowPlan.plants.push(plant);
                        }
                    });
                    $scope.selectedGrowPlan.plants.sort(function(a, b) { return a.name < b.name; });
                    
                    $scope.expectedGrowPlanDuration = $scope.selectedGrowPlan.phases.reduce(function(prev, cur){ return prev.expectedNumberOfDays + cur.expectedNumberOfDays;});
                });

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
                if($scope.selectedPlants.length){
                    $scope.updatefilteredGrowPlans();
                }
            };

            $scope.filterPlantList = function(){
                var filteredPlantList = $filter('filter')($scope.plants, { name : $scope.plantQuery });
                $scope.filteredPlantList = filteredPlantList;
            };

            $scope.addPlant = function(){
                var newPlant = {name : $scope.plantQuery };
                $scope.filteredPlantList.push(newPlant);
                $scope.selectedPlants.push(newPlant);
            };  

            $scope.updateSelectedPlants = function(){
                for (var i = $scope.plants.length; i--;) {
                    Object.keys($scope.selected.plant).forEach(function(_id) {
                        if ($scope.selected.plant[_id] && $scope.plants[i]._id == _id) {
                            $scope.selectedPlants.push($scope.plants[i]);
                        }
                    });
                }
                $scope.updatefilteredGrowPlans();
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
            
            $scope.updatePhaseDurations = function(){
                var currentExpectedPlanDuration = $scope.selectedGrowPlan.phases.reduce(function(prev, cur){ return prev.expectedNumberOfDays + cur.expectedNumberOfDays;}),
                    difference = $scope.expectedGrowPlanDuration - currentExpectedPlanDuration,
                    phases = $scope.selectedGrowPlan.phases,
                    i, phase;
                
                
                // If it's a positive change, just add all the days onto the last phase
                if (difference > 0){
                    phases[phases.length - 1].expectedNumberOfDays += difference;
                } else if (difference < 0){
                    // If it's a negative change, decrement from the final phase first, preserving a min of 1 day duration. Then start
                    // removing days from earlier phases. Preserve at least 1 day in all phases
                    for (i = phases.length; i--;){
                        phase = phases[i];
                        while (phase.expectedNumberOfDays > 1 && difference < 0){
                            phase.expectedNumberOfDays--;
                            difference++;        
                        } 
                    }
                }
                
                $scope.expectedGrowPlanDuration = $scope.selectedGrowPlan.phases.reduce(function(prev, cur){ return prev.expectedNumberOfDays + cur.expectedNumberOfDays;});
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

            $scope.submit = function(){
                if($scope.selectedGrowPlan){
                    console.log('submit!');
                    var growPlanInstance = viewModels.compileGrowPlanViewModelToServerModel($scope.selectedGrowPlan);
                    console.log(growPlanInstance);
                }
            }
        }]
    };

    $(function () {
        bpn.pages.growplans.init();
    });

});