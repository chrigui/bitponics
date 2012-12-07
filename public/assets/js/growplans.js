Bitponics.pages.growplans = {

    HEADER_SELECTOR: '#header',
    CONTAINER_SELECTOR: '#main', 
    GROWPLAN_FORM_SELECTOR: 'form#growplans',
    SELECTED_CLASS: 'selected',
    SYSTEM_SECTION_SELECTOR: '#system_selection',
    PLANT_SECTION_SELECTOR: '#plant_selection',
    GROWPLAN_DURATION_SELECTOR: '#phase_slider_duration',

    defaultGrowPlanDuration: 182,
    maxPhases: 4,

    init: function() {
        var self = this;
        self.container = $(self.CONTAINER_SELECTOR);
        self.formContainer = $(self.GROWPLAN_FORM_SELECTOR);
        self.initEventHandlers();
    },
    
    initEventHandlers: function() {
        var self = this;
        //self.formContainer.on('change', '#system_selection :input:not(.search), #plant_selection :input:not(.search)', $.proxy(self.handleInputAnswered, self));
        self.formContainer.on('submit', $.proxy(self.handleFormSubmit, self));

    },


    filterGrowPlanList: function(input) {
        var self = this,
            inArray = $.inArray(input.val(), self.growPlanList.currentFilters);

        //if answer is not in array and it is selected, then add to filter list
        if (inArray === -1 && input.is(':checked')) {
            self.growPlanList.currentFilters.push(input.val().toLowerCase());

        //else if answer is in array and is not checked, remove it
        } else if(!input.is(':checked')) {
            self.growPlanList.currentFilters.splice(inArray, 1);
        }

        //remove any unselected radio values
        if (input.attr('type') == 'radio') {
            $(input).parent().siblings().find('[type=radio]:not(:checked)').each(function (index, radioInput) {
                self.growPlanList.currentFilters = $.grep(self.growPlanList.currentFilters, function(value) {
                    return value != $(radioInput).val().toLowerCase();
                });
            });
        }

        // filter on all answers
        self.growPlanList.filter(function(item) {
            var match = false;
            $.each(self.growPlanList.currentFilters, function(index1, filterValue) {
                var re = new RegExp(filterValue, "ig");
                $.each(item.values(), function(index2, itemValue) {
                    if (itemValue.search(re) != -1) {
                        match = true;
                    }
                });
            });
            return match;
        });

        $.each(self.growPlanList.items, function(index, item) {
            $(item.elm).find(':input').attr('disabled', false);
        });

    },


    GrowPlanController : ['$scope', '$filter', function($scope, $filter){
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


        $scope.setSelectedGrowPlan = function() {
            var growPlans = Bitponics.growPlans;
            for (var i = growPlans.length; i--;){
                if (growPlans[i]._id == $scope.selectedGrowPlanId){
                    $scope.selectedGrowPlan = growPlans[i];
                    break;
                }
            }
            if (!$scope.selectedGrowPlan) { $scope.selectedGrowPlan = Bitponics.growPlanDefault; }
            
            // Update grow plan plants
            $scope.selectedPlants.forEach(function(plant, index){
                if (!$scope.selectedGrowPlan.plants.some(function(gpPlant){ gpPlant.name === plant.name })){
                    $scope.selectedGrowPlan.plants.push(plant);
                }
            });
            $scope.selectedGrowPlan.plants.sort(function(a, b) { return a.name < b.name; });

            // Update grow plan phases
            var allPhases = ['Seedling', 'Vegetative', 'Blooming', 'Fruiting'];
            //if (!$scope.selectedGrowPlan.phases           

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
            $scope.selectedGrowSystem = $scope.growSystems.filter(function(system, index){ return growSystemSelections[system._id]; })
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
            $scope.selectedPlants = $scope.plants.filter(function(plant, index){ return plantSelections[plant._id]; })
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
                while (difference){
                    for (i = phases.length; i--;){
                        phase = phases[i];
                        while (phase.expectedNumberOfDays > 1 && difference < 0){
                            phase.expectedNumberOfDays--;
                            difference++;        
                        } 
                    }
                }
            }
            
            $scope.expectedGrowPlanDuration = $scope.selectedGrowPlan.phases.reduce(function(prev, cur){ return prev.expectedNumberOfDays + cur.expectedNumberOfDays;});
        };


        $scope.addIdealRange = function(e){
            var phase = e.phase,
                newIdealRange = {
                    _id : ''
                };
            phase.idealRanges.unshift(newIdealRange);
        };

    }]
};

$(function () {
    Bitponics.pages.growplans.init();
});

