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
            listClass: 'grid'
        });

        //create template from LI markup in order to let users add new plants on the fly
        self.plantListItemTemplate = $(self.plantList.list).find('li:first');
        self.plantListItemReplaceToken = self.plantListItemTemplate.find('input').val();

        //setup recommended grow plan list for filtering
        self.growPlanList = new List('growplan_results', {
            valueNames: [ 'gplist_description', 'gplist_plants', 'gplist_system' ],
            listClass: 'grid'
        });

        self.growPlanList.currentFilters = []; //keep track of filters so we can combine multiple
    },
    
    initEventHandlers: function() {
        var self = this;
        self.formContainer.on('change', '#system_selection :input:not(.search), #plant_selection :input:not(.search)', $.proxy(self.handleInputAnswered, self));
        self.formContainer.on('submit', $.proxy(self.handleFormSubmit, self))
        self.formContainer.on('keypress', '#plant_selection input.search', $.proxy(self.handleListFilter, self));
        self.formContainer.on('click', '#plant_selection button.add', $.proxy(self.handlePlantAdd, self))
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
        console.log('activate grow plan')
    },

    filterGrowPlanList: function(input) {
        var self = this,
            inArray = $.inArray(input.val(), self.growPlanList.currentFilters);

        //if answer is not in array and it is selected, then add to filter list
        if (inArray === -1 && input.is(':checked')) {
            self.growPlanList.currentFilters.push(input.val());

        //else if answer is in array and is not checked, remove it
        } else if(!input.is(':checked')) {
            self.growPlanList.currentFilters.splice(inArray, 1);
        }

        //remove any unselected radio values
        if (input.attr('type') == 'radio') {
            $(input).parent().siblings().find('[type=radio]:not(:checked)').each(function (index, radioInput) {
                self.growPlanList.currentFilters = $.grep(self.growPlanList.currentFilters, function(value) {
                    return value != $(radioInput).val();
                });
            });
        }

        console.log(self.growPlanList.currentFilters);

        //filter on all answers
        self.growPlanList.search(self.growPlanList.currentFilters.join(' '));
    }
};

$(function () {
    Bitponics.pages.growplans.init();
});