Bitponics.pages.growplans = {
    init: function() {
    },

    app: angular.module( "GrowPlanModule", [ "ngResource" ] ),

    GrowPlanController : ['$scope', '$filter', '$resource', function($scope, $filter, $resource){
        $scope.plants = Bitponics.plants;
        $scope.filteredPlantList = angular.copy($scope.plants);
        $scope.controls = Bitponics.controls;
        $scope.sensors = Bitponics.sensors;
        $scope.plantSelections = {};
        $scope.selectedPlants = [];
        $scope.plantQuery = '';
        $scope.growSystems = Bitponics.growSystems;
        $scope.growSystemSelections = {};
        $scope.currentGrowPlanDay = 0;
        $scope.growPlans = Bitponics.growPlans;
        $scope.filteredGrowPlanList = angular.copy($scope.growPlans);
        $scope.timesOfDayList = Bitponics.Utils.generateTimesOfDayArray();
        $scope.actionDurationTypeOptions = ['seconds','minutes','hours','days','weeks','months'];

        var GrowPlanModel = $resource(
            '/api/grow_plans/',
            {},
            {
                'query':  { method: 'GET', isArray: true }
            }
        );
    
        
        /**
         * Adds/calculates properties necessary for UI presentation
         */
        function initGrowPlanViewModel(growPlan){
            growPlan.phases.forEach(function(phase, index){
                phase.idealRanges.forEach(function(idealRange, idealRangeIndex){
                    if (!idealRange.applicableTimeSpan){
                        idealRange.noApplicableTimeSpan = true;
                    }
                });

                phase.actionsViewModel = [];
                phase.actions.forEach(function(action){
                    var overallDuration = 0;
                    action.isDailyCycle = false;
                    if (action.cycle.repeat){
                        action.scheduleType = 'repeat';
                        
                        action.cycle.states.forEach(function(state){
                            overallDuration += moment.duration(action.cycle.states[0].duration || 0, action.cycle.states[0].durationType || '').asMilliseconds();
                        });
                        
                        if (moment.duration(overallDuration).asDays() === 1){
                            action.isDailyCycle = true;
                        }
                    } 
                    else {
                        action.scheduleType = 'phaseStart';
                    }
                    phase.actionsViewModel.push(action);
                });
                phase.phaseEndActions.forEach(function(action){
                    action.scheduleType = 'phaseEnd';
                    phase.actionsViewModel.push(action);
                });
            });
            return growPlan;
        };
        

        /**
         * Convert Action ViewModel back to server model
         */
        function compileGrowPlanViewModelToServerModel(growPlan){
            growPlan.phases.forEach(function(phase, index){
                phase.idealRanges.forEach(function(idealRange, idealRangeIndex){
                    if (idealRange.noApplicableTimespan){
                        idealRange.applicableTimespan = undefined;   
                    }
                });

                phase.actions = [];
                phase.phaseEndActions = [];

                phase.actionsViewModel.forEach(function(actionViewModel){
                    switch(actionViewModel.scheduleType){
                        case 'phaseStart':
                        case 'repeat':
                            phase.actions.push(actionViewModel);
                            break;
                        case 'phaseEnd':
                            phase.phaseEndActions.push(actionViewModel);
                            break;
                    }
                });
            });
            return growPlan;             
        };


        $scope.setSelectedGrowPlan = function() {
            var growPlans = $scope.growPlans;
            for (var i = growPlans.length; i--;){
                if (growPlans[i]._id == $scope.selectedGrowPlanId){
                    $scope.selectedGrowPlan = growPlans[i];
                    break;
                }
            }
            if (!$scope.selectedGrowPlan) { $scope.selectedGrowPlan = Bitponics.growPlanDefault; }
            
            initGrowPlanViewModel($scope.selectedGrowPlan);

            // Update grow plan plants.
            $scope.selectedPlants.forEach(function(plant, index){
                if (!$scope.selectedGrowPlan.plants.some(function(gpPlant){ gpPlant.name === plant.name })){
                    $scope.selectedGrowPlan.plants.push(plant);
                }
            });
            $scope.selectedGrowPlan.plants.sort(function(a, b) { return a.name < b.name; });
            
            $scope.expectedGrowPlanDuration = $scope.selectedGrowPlan.phases.reduce(function(prev, cur){ return prev.expectedNumberOfDays + cur.expectedNumberOfDays;});
        };

        $scope.filteredSensors = function() {
            var list = [];
            angular.forEach($scope.sensors, function(sensor) {
              list.push(sensor);
            });
            return list;
        };

        $scope.updateSelectedGrowSystem = function(el){
            var growSystemSelections = $scope.growSystemSelections;
            $scope.selectedGrowSystem = el.system;
            console.log($scope.selectedPlants);
            if($scope.selectedPlants.length){
                $scope.updateSelectedGrowPlans();
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
            var plantSelections = $scope.plantSelections;
            $scope.selectedPlants = $scope.plants.filter(function(plant, index){ return plantSelections[plant._id]; });
            $scope.updateSelectedGrowPlans();
        };

        $scope.updateSelectedGrowPlans = function(){
            var selectedPlantIds = $scope.selectedPlants.map(function(plant) { return plant._id });
            $scope.filteredGrowPlanList = GrowPlanModel.query({
                plants: selectedPlantIds, 
                growSystem: $scope.selectedGrowSystem._id
            }, function(){
                console.log('GrowPlanModel: ',$scope.filteredGrowPlanList);
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
            console.log('submit!');
            if($scope.selectedGrowPlan){
                console.log(compileGrowPlanViewModelToServerModel($scope.selectedGrowPlan));
            }
            return false
        }
    }]
};

$(function () {
    Bitponics.pages.growplans.init();
});

