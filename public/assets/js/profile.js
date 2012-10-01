Bitponics.pages.profile = {
    
    container: $('body'),

    init: function() {
        $('#timezone-image').timezonePicker({
          target: 'locale_timezone',
          countryTarget: 'country_timezone'
        });
        this.initEventHandlers();
    },

    initEventHandlers: function() {
        var self = this;

        self.container.on('click', '#detect', function(e){
            e.preventDefault();
            $('#timezone-image').timezonePicker('detectLocation', {
                success: function(p) {
                    console.log('success')
                    console.log(p)
                },
                error: function(p) {
                    console.log('error')
                    console.log(p)
                },
                complete: function(p) {
                    console.log('complete')
                    console.log(p)
                }
            });
        });
        
    }
};

$(function () {   
    Bitponics.pages.profile.init();
});