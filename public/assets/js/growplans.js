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
        
        //setup plant list for filtering using Listjs: https://github.com/javve/list/blob/master/README.md
        self.plantList = new List('plant_selection', {
            valueNames: [ 'plant' ],
            listClass: 'grid',
            plugins: [
                [ 'fuzzySearch' ]
            ]
        });

        //create template from LI markup in order to let users add new plants on the fly
        self.plantListItemTemplate = $(self.plantList.list).find('li:first');
        self.plantListItemReplaceToken = self.plantListItemTemplate.find('input').val();

        self.growPlanList = new List('growplan_results', {
            valueNames: [ 'gplist_description', 'gplist_plants', 'gplist_system' ],
            listClass: 'grid'
        });

        self.growPlanList.currentFilters = []; //keep track of filters so we can combine multiple

        $('.phase-slider-input').change(); //trigger refresh of sliders on page load
    },
    
    initEventHandlers: function() {
        var self = this;
        self.formContainer.on('change', '#system_selection :input:not(.search), #plant_selection :input:not(.search)', $.proxy(self.handleInputAnswered, self));
        self.formContainer.on('submit', $.proxy(self.handleFormSubmit, self));
        self.formContainer.on('keypress', '#plant_selection input.search', $.proxy(self.handleListFilter, self));
        self.formContainer.on('click', '#plant_selection button.add', $.proxy(self.handlePlantAdd, self));
        self.formContainer.on('click', '#growplan_results label', $.proxy(self.handleGrowPlanSelect, self));
        self.formContainer.on('click', '#growplan_edit .phase-tabs .toggle', $.proxy(self.updatePhaseUI, self));
        self.formContainer.on('click', '#growplan_edit .phase-tabs li', $.proxy(self.updatePhaseUI().focusPhase, self));
        self.formContainer.on('change', '#growplan_edit #phase_slider_duration', $.proxy(self.updatePhaseUI().refreshAllSliders, self));
        //self.formContainer.on('mouseup touchend', '#growplan_edit .active .ui-slider-handle:last', $.proxy(self.updatePhaseUI().refreshAllSliders, self));
        self.formContainer.on('keypress', '#growplan_edit #phase_slider_duration', $.proxy(self.updatePhaseUI().handleDurationKeypress, self));
        self.formContainer.on('change', '#growplan_edit .date-duration', $.proxy(self.updatePhaseUI().setPhaseDays, self));

        //TODO: make more concise with $('.phase-slider-input') selector
        $('#phase_slider_0').change(function() {
            var min = parseInt($(this).val());
            var max = parseInt($('#phase_slider_1').val());
            if (min > max) {
                $(this).val(max);
                $(this).slider('refresh');
            }
        });
        $('#phase_slider_1').change(function() {
            var min = parseInt($('#phase_slider_0').val());
            var max = parseInt($('#phase_slider_2').val());

            if (min > $(this).val()) {
                $(this).val(min);
                $(this).slider('refresh');
            } else if($(this).val() > max) {
                $(this).val(max);
                $(this).slider('refresh');
            }
        });
        $('#phase_slider_2').change(function() {
            var min = parseInt($('#phase_slider_1').val());
            var max = parseInt($('#phase_slider_3').val());

            if (min > $(this).val()) {
                $(this).val(min);
                $(this).slider('refresh');
            } else if($(this).val() > max) {
                $(this).val(max);
                $(this).slider('refresh');
            }
        });
        $('#phase_slider_3').change(function() {
            var min = parseInt($('#phase_slider_2').val());
            var max = parseInt($(this).val());

            if (min > max) {
                $(this).val(min);
                $(this).slider('refresh');
            }
        });
        $('.phase-slider-input').change($.proxy(self.handlePhaseSlider, self))
    },

    handleListFilter: function(e) {
        if ( e.which == 13 ) {
            var self = this,
                search = $(e.target), //get search field
                hasList = self.plantList.listContainer.contains(e.target), //get its filter list
                matchingItems = self.plantList.matchingItems; //get currently matching items

            if (hasList) {
                if (matchingItems.length == 1) { //filtered to 1 item
                    $(self.plantList.list).find('label').click(); //select item
                    search.val('').focus(); //clear search
                } else if (matchingItems.length == 0) { //filtered out all, want to add new?
                    if (search.val().trim() != '') {
                        search.siblings('.add').remove();
                        $('<button class="add" data-plant="'+search.val()+'">Add</button>').insertAfter(search);
                    }
                }
            }
            e.preventDefault();
        }
    },

    handleInputAnswered: function(e) {
        var self = this,
            input = $(e.target),
            search = input.closest('.sortlist').siblings('.search'),
            isInGrowPlanList = self.growPlanList.listContainer.contains(e.target);

        //filter grow plans if not clicking on a grow plan itself
        if (!isInGrowPlanList) {
            self.filterGrowPlanList(input);
        }

        //clear search field if present
        if(search.length) {
            search.val('');
        }

    },

    handlePlantAdd: function(e) {
        var self = this,
            plant = $(e.target).attr('data-plant'),
            templ = self.plantListItemTemplate.html(),
            replaceToken = new RegExp(self.plantListItemReplaceToken, 'ig'),
            newLI = '<li>' + templ.replace(replaceToken, plant) + '</li>';

        // self.plantList.add({ plant: plant }); //doesnt work for me
        
        //clear search
        self.plantList.search();

        //add new plant
        $(self.plantList.list).append(newLI);
        
        //refresh list
        self.plantList = new List('plant_selection', { 
            valueNames: [ 'plant' ],
            listClass: 'grid'
        });

        //click on new plant to make it selected
        $(self.plantList.list).find('label[for=' + plant + ']').click();

        //remove Add button
        $(e.target).fadeOut().remove();

        e.preventDefault();
    },

    handleFormSubmit: function(e) {

// {
//     createdAt: "2012-11-05T02:38:38.101Z",
//     updatedAt: "2012-11-05T02:38:38.101Z",
//     _id: "506de30c8eebf7524342cb70",
//     createdBy: "506de30a8eebf7524342cb6c",
//     name: "All-Purpose",
//     description: "A generic grow plan suitable for running a garden with a wide variety of plants. It won't get you optimum yields for everything, but it's a good starting point while you learn about the specific needs of your plants.",
//     expertiseLevel: "beginner",
//     __v: 0,
//     visibility: "public",
//     phases: [{
//         _id: "506de30c8eebf7524342cb72",
//         name: "Seedling",
//         description: "Seedling phase, from planting seeds until first true leaves appear. The Bitponics device isn't necessary for this phase since seedlings do fine with just plain tap water, and most seed-starting systems are too small for the water sensors anyway. This phase is for the "
//         All - Purpose " grow plan so its sensor ranges aren't optimal for any specific plant, but instead describe a range that should be adequate for most plants.",
//         expectedNumberOfDays: 7,
//         growSystem: "506de3008eebf7524342cb40",
//         growMedium: "rockwool",
//         phaseEndDescription: "This phase is over once the seedlings start growing their first true leaves.",
//         nutrients: [],
//         idealRanges: [{
//             _id: "506de30c8eebf7524342cb71",
//             sCode: "water",
//             actionBelowMin: "506de30c8eebf7524342cb73",
//             actionAboveMax: "506de30d8eebf7524342cb75",
//             valueRange: {
//                 min: 18.33,
//                 max: 21.11
//             }
//         }, {
//             _id: "506de30d8eebf7524342cb76",
//             sCode: "air",
//             actionBelowMin: "506de2fc8eebf7524342cb2b",
//             actionAboveMax: "506de2fb8eebf7524342cb2a",
//             valueRange: {
//                 min: 12.77,
//                 max: 21.11
//             }
//         }, {
//             _id: "506de30b8eebf7524342cb6e",
//             sCode: "full",
//             actionBelowMin: "506de2fb8eebf7524342cb28",
//             actionAboveMax: "506de2fb8eebf7524342cb29",
//             applicableTimeSpan: {
//                 startTime: 28800000,
//                 endTime: 72000000
//             },
//             valueRange: {
//                 min: 2000,
//                 max: 10000
//             }
//         }],
//         phaseEndActions: [],
//         actions: [
//             "506de3128eebf7524342cb87",
//             "506de2f18eebf7524342cb27"],
//         light: {
//             fixture: "506de3028eebf7524342cb47",
//             fixtureQuantity: 1,
//             bulb: "506de3018eebf7524342cb42"
//         }
    // }],
    //     controls: [
    //         "506de2fd8eebf7524342cb32",
    //         "506de2fc8eebf7524342cb2d"
    //     ],
    //     sensors: [
    //         "506de3068eebf7524342cb59",
    //         "506de3068eebf7524342cb5a",
    //         "506de3078eebf7524342cb5d",
    //         "506de3078eebf7524342cb5e",
    //         "506de3078eebf7524342cb5f",
    //         "506de3088eebf7524342cb63"
    //     ],
    //     plants: [ ]


        e.preventDefault();
        var form = e.target,
            data = {
                createdBy: Bitponics.user._id,
                name: $('#gpedit_name').val(),
                description: $('#gpedit_description').val(),
                //expertiseLevel: $('#gpedit_expertiseLevel').val(),
                visibility: 'public',
                phases: [],
                controls: [],
                sensors: [],
                plants: []
            };

        //phases
        $('.phaseRangeSlider .phase-slider.active').each(function() {

            var phaseName = Bitponics.Utils.toTitleCase($(this).attr('data-phase')),
                phase = { 
                    actions: [],
                    description: $('#gpedit_'+phaseName+'_description').val(),
                    expectedNumberOfDays: $(this).find('input.date-duration').val(),
                    growMedium: $('#gpedit_'+phaseName+'_growmedium').val(),
                    growSystem: {},
                    idealRanges: [],
                    light: {},
                    name: phaseName,
                    nutrients: [],
                    phaseEndActions: []
                    phaseEndDescription: $('#gpedit_'+phaseName+'_enddescription').val()
                };

            //phase actions
            $('[name=gpedit_'+phaseName+'_actions]:checked').each(function() {
                var action = {
                    description: '',
                    cycle: {
                        repeat: true,
                        states: [{
                            durationType: '',
                            duration: 8,
                        }, {
                            message: '',
                        }, {
                            durationType: '',
                            duration: 16
                        }]
                    }
                };

                //now fill in data from form for this action?

                phase.actions.push(action);
            });

            // $(this).find(':input').each(function() {
            //     console.log('name: ' + $(this).attr('name') + ' | value: ' + $(this).val())
            // });
        });


        //controls

        //sensors

        //plants


        $.ajax({
            type: 'POST',
            url: form.action,
            data: data
        })
        .done(function(data){
            console.log('Form submit succeeded.');
            console.log(data);
        })
        .fail(function(data){
            console.log('Form submit failed.');
            console.log(data);
        });
        return false;
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

    handleGrowPlanSelect: function(e) {
        var self = this,
            growPlanLabel = $(e.target).attr('for'),
            growPlanId = growPlanLabel.replace('gplist_input_', ''),
            growPlanFormInputs = $('#growplan_edit :input'),
            templ = self.plantListItemTemplate.html(),
            replaceToken = new RegExp(self.plantListItemReplaceToken, 'ig'),
            selectedPlants = [],
            fullPlantList = [];

        Bitponics.growPlans.push(Bitponics.growPlanDefault); //add default so we can check against that
        Bitponics.growPlans.forEach( function(growPlan) {
            if (growPlan._id == growPlanId) {
                fullPlantList = growPlan.plants;

                $('#gpedit__id').val(growPlan._id);
                $('#gpedit_name').val(growPlan.name);
                $('#gpedit_description').val(growPlan.description);
                //$('#gpedit_plants').val(growPlan.plants);
                
                //add plants selected in filter step to current grow plan plants
                //TODO: do we want this?
                self.formContainer.find('#plant_selection input[name=plants]:checked').each(function(){
                    selectedPlants.push($(this).val());
                });
                fullPlantList = selectedPlants.concat(growPlan.plants);
                
                //clear plant list
                $('#growplan_edit ul.plantlist').empty();

                //populate plant list
                for(var i = 0; i < fullPlantList.length; i++){
                    var newLI = '<li>' + templ.replace(replaceToken, fullPlantList[i]) + '</li>'
                    newLI = $(newLI);
                    newLI.find('input:first').attr('id', fullPlantList[i] + '_edit')
                        .attr('checked', true)
                        .end().find('label:first').attr('for', fullPlantList[i] + '_edit');
                    $('#growplan_edit ul.plantlist').append(newLI)
                }

                $('#gpedit_expertiseLevel').val(growPlan.expertiseLevel);
                $('#gpedit_nutrients').val(growPlan.nutrients);
                $('#gpedit_sensors').val(growPlan.sensors);
                $('#gpedit_controls').val(growPlan.controls);
                self.updatePhaseUI(null, growPlan.phases);

            }
        });
    },
    
    handlePhaseSlider: function(e, ui) {
        var self = this,
            currentSliderInteractedWith = $(e.target).parents('.phase-slider'),
            currentPhaseDays = currentSliderInteractedWith.find('input[data-phase]').val(),
            phaseSliders = $('.phaseRangeSlider .phase-sliders'),
            date;
        
        phaseSliders.siblings('.slide-back').remove(); //remove slider backgrounds, regenerate below
        
        self.updatePhaseUI().focusPhase(currentSliderInteractedWith) //focus the current phase being interacted with

        //loop through the sliders and set the background colors appropriately
        $(phaseSliders.find('a').get().reverse()).each(function(i) {
            var numPhases = $('input[data-phase]').length,
                phaseName = $('#phase_slider_' + (numPhases - 1 - i)).attr('data-phase'),
                phaseDays = $('input[data-phase='+phaseName+']').val(),
                phaseDateRangeEl = $('.phase-slider[data-phase='+phaseName+']').find('date-range'),
                phaseDateDurationEl = $('.phase-slider[data-phase='+phaseName+']').find('date-duration');

            if(!$(this).parents('.phase-slider').hasClass('inactive')){
                $('.phaseRangeSlider').append($('<div></div>')
                    .addClass('slide-back '+phaseName)
                    .css({
                        'width': $(this).position().left - 5
                    }));
            }
        });

        //set date range and total days for this phase
        setTimeout(function () {
            date = self.updatePhaseUI().getPhaseDateRange(currentSliderInteractedWith);
            currentSliderInteractedWith.find('.date-range').html(date.startDate + ' - ' + date.endDate)
                .end().find('.date-duration').val(date.range);
        }, 100);
    },


    updatePhaseUI: function(e, phases) {
        var self = this,
            maxSliderVal = self.defaultGrowPlanDuration,
            phaseSliders = $('.phase-slider'),
            phaseTabs = $('.phase-tabs li'),
            phaseSliderDiv,
            phaseName,
            phaseInput,
            phaseIndex,
            phaseVal = 0,
            numActivePhases = 0;

        if (!e && phases) { //activate default phases and set initial styles
            phaseSliders.addClass('inactive'); //reset phase sections
            phaseTabs.addClass('inactive'); //reset tabs
            phases.forEach(function(phase){
                phaseVal = phaseVal + phase.expectedNumberOfDays;
                phaseSliders.each(function(i, slider){
                    phaseSliderDiv = $(slider);
                    phaseName = phaseSliderDiv.attr('data-phase');
                    phaseInput = $('input[data-phase="'+phaseName+'"]');
                    phaseIndex = $('.phase-slider-input').index(phaseInput);
                    //nextPhaseVal = $('.phase-slider-input:eq('+(phaseIndex+1)+')').val();

                    if (!phaseVal) phaseVal = maxSliderVal;

                    if ($(this).attr('data-phase') == phase.name.toLowerCase()) {
                        activatePhase(phaseSliderDiv);
                        numActivePhases++;
                        if (numActivePhases == 1) {
                            var p = phaseSliderDiv;
                            setTimeout(function(){
                                focusPhase(p);
                            }, 1000);
                        }
                    }
                });
                phaseSliders.filter('.inactive')
                    .find('.phase-slider-input')
                    .val(maxSliderVal)
                    .slider('refresh');
            });
        } else if (e && e.target) { //user customized phases
            //phaseSliderDiv = $(e.target).parents('.phase-slider'),
            phaseName = $(e.target).parents('[data-phase]').attr('data-phase');
            phaseSliderDiv = $('.phase-slider[data-phase='+phaseName+']');
            //phaseName = phaseSliderDiv.attr('data-phase'),
            phaseInput = $('input[data-phase="'+phaseName+'"]'),
            phaseIndex = $('.phase-slider-input').index(phaseInput),
            phaseVal = $('.phase-slider-input:eq('+(phaseIndex+1)+')').val();

            if (!phaseVal) phaseVal = maxSliderVal;

            if (phaseSliderDiv.hasClass('inactive')) {
                activatePhase(phaseSliderDiv);
                focusPhase(phaseSliderDiv);
            } else {
                deactivatePhase(phaseSliderDiv);
            }

        }



        function activatePhase(phase) {
            //activate all phases before this one and set values for this phase
            phase.add('.phase-slider:lt('+phaseIndex+').inactive')
                .removeClass('inactive')
                .addClass('active')
                .find('.phase-slider-input')
                .slider('enable')
                .removeClass('ui-disabled mobile-textinput-disabled')
                .val(phaseVal)
                .slider('refresh');

            //set tab state to match
            $('.phase-tabs li:lt('+(phaseIndex+1)+')').removeClass('inactive').addClass('active');

            //set values for all phases before this one
            $('.phase-slider-input:lt('+phaseIndex+')').each(function(i){
                var val = $(this).val();
                if (val == phaseVal) {
                    $(this).val(val - 60/i);
                    $(this).slider('refresh');
                }
            })
        }

        function deactivatePhase(phase) {
            //deactive this phase and all phases after this one, set value for this phase to max value
            phase.add('.phase-slider:gt('+phaseIndex+')')
                .removeClass('active')
                .addClass('inactive')
                .find('.phase-slider-input')
                .val(maxSliderVal)
                .slider('disable')
                .slider('refresh');

            //set tab state to match
            $('.phase-tabs li:gt('+(phaseIndex-1)+')').removeClass('active').addClass('inactive');

            $('.phase-slider-input:eq('+(phaseIndex-1)+')')
                .val(maxSliderVal)
                .slider('refresh');
        }

        function focusPhase(p) {
            var phase;
            if (p && p.target) { //is click event
                phase = $(p.target).attr('data-phase');
            } else { //is phase div passed in
                phase = p.attr('data-phase');
            }
            
            if( $('div[data-phase='+phase+'], li[data-phase='+phase+']').hasClass('active') ) { //only focus phase if it is active in phase slider
                $('div[data-phase], li[data-phase]').removeClass('focused').filter('[data-phase='+phase+']').addClass('focused');
            }
        }

        function getDateFromDays(days) {
            var now = new Date();
            var newDate = new Date( now.getTime() + parseInt(days)*24*60*60*1000 );
            return newDate.getMonth()+1 +'/'+ newDate.getDate() +'/'+ newDate.getFullYear()
        }

        function getPhaseDateRange(phase) {
            var phaseIndex = $('.phase-slider').index(phase),
                startDay = 0,
                endDay = phase.find('.phase-slider-input').val();
            
            if (!!phase.prev('.phase-slider').length) {
                startDay = phase.prev('.phase-slider').find('.phase-slider-input').val()
            }

            // console.log(
            //     {
            //         index: phaseIndex,
            //         startDay: parseInt(startDay),
            //         endDay: parseInt(endDay),
            //         startDate: getDateFromDays(parseInt(startDay)),
            //         endDate: getDateFromDays(parseInt(endDay)),
            //         range: parseInt(endDay - startDay)
            //     }
            // )
            return {
                startDay: parseInt(startDay),
                endDay: parseInt(endDay),
                startDate: getDateFromDays(parseInt(startDay)),
                endDate: getDateFromDays(parseInt(endDay)),
                range: parseInt(endDay - startDay)
            }
        }

        function refreshAllSliders(e) {
            var durationInput = $(self.GROWPLAN_DURATION_SELECTOR),
                days = durationInput.val();

            self.defaultGrowPlanDuration = days;
            phaseSliders.find('input[data-phase]').attr('max', days).change()

            //TODO: when making grow plan duration longer, need to set inactive phase sliders to max, but they are disabled so cant set them
                // .end()
                // .filter('.inactive')
                // .find('.phase-slider-input')
                // .removeAttr('disabled')
                // .val(days)
                // .attr('disabled', 'disabled');
        
        }

        function handleDurationKeypress(e) {
            if (e.which == 13) {
                refreshAllSliders();
                e.preventDefault();
            }
        }

        function setPhaseDays(e) {
            var phase = $(e.target).parents('.phase-slider'),
                startDay = getPhaseDateRange(phase).startDay;
                totalDays = 1*$(e.target).val() + startDay;
            phase.find('.phase-slider-input').val(totalDays).change();
        }

        return {
            getDateFromDays: getDateFromDays,
            getPhaseDateRange: getPhaseDateRange,
            focusPhase: focusPhase,
            refreshAllSliders: refreshAllSliders,
            handleDurationKeypress: handleDurationKeypress,
            setPhaseDays: setPhaseDays
        }
    }
};

$(function () {
    Bitponics.pages.growplans.init();
});

