Bitponics.pages.growplans = {

    HEADER_SELECTOR: '#header',
    CONTAINER_SELECTOR: '#main', 
    GROWPLAN_FORM_SELECTOR: 'form#growplans',
    SELECTED_CLASS: 'selected',
    SYSTEM_SECTION_SELECTOR: '#system_selection',
    PLANT_SECTION_SELECTOR: '#plant_selection',


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
        e.preventDefault();
        var form = e.target,
            $form = $(form);
        
        $.ajax({
            type: 'POST',
            url: form.action,
            data: $form.serialize()
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
            phaseSliders = $('.phaseRangeSlider .phase-sliders');
        
        phaseSliders.find('.phase-slider').removeClass('focused') //remove focus class from all sliders
            .end().siblings('.slide-back').remove(); //remove slider backgrounds, regenerate below
        currentSliderInteractedWith.addClass('focused'); //focus the current phase being interacted with

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

                //TODO: update phaseDateRangeEl for each phase
                // console.log(phaseDays);
                // console.log(self.updatePhaseUI().getDateFromDays(phaseDays));
            }
        });
    },


    updatePhaseUI: function(e, phases) {
        var maxSliderVal = 182,
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

                    if ($(this).hasClass(phase.name.toLowerCase())) {
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
            $('.phase-tabs li:gt('+(phaseIndex-1)+')').removeClass('inactive').addClass('active');

            $('.phase-slider-input:eq('+(phaseIndex-1)+')')
                .val(maxSliderVal)
                .slider('refresh');
        }

        function focusPhase(p) {
            var phase;
            if (p && p.target) { //click event
                phase = $(p.target).attr('data-phase');
                //$(p.target).siblings().removeClass('focused').end().addClass('focused');
            } else { //phase div
                phase = p.attr('data-phase');
            }
            console.log('focus phase: '+phase);
            $('[data-phase]').removeClass('focused').filter('[data-phase='+phase+']').addClass('focused');
        }

        function getDateFromDays(days) {
            var now = new Date();
            var newDate = new Date( now.getTime() + days*24*60*60*1000 );
            return newDate.getMonth()+1 +'/'+ newDate.getDate() +'/'+ newDate.getFullYear()
        }

        return {
            getDateFromDays: getDateFromDays,
            focusPhase: focusPhase
        }
    }
};

$(function () {
    Bitponics.pages.growplans.init();
});

