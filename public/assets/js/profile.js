// bpn = bpn || {};
// bpn.pages.profile = {
    
//     container: $('body'),

//     init: function() {
//         $('#timezone-image').timezonePicker({
//           target: '#country_timezone',
//           countryTarget: '#locale_timezone'
//         });
//         this.initEventHandlers();

//         $('#country_timezone').val(bpn.user.timezone);
//         $('#locale_timezone').val(bpn.user.locale.territory);
//     },

//     initEventHandlers: function() {
//         var self = this;

//         self.container.on('click', '#detect', function(e){
//             e.preventDefault();
//             $('#timezone-image').timezonePicker('detectLocation', {
//                 success: function(p) {
//                     console.log('success')
//                     console.log(p)
//                 },
//                 error: function(p) {
//                     console.log('error')
//                     console.log(p)
//                 },
//                 complete: function(p) {
//                     console.log('complete')
//                     console.log(p)
//                 }
//             });
//         });
        
//     }
// };

// $(function () {   
//     bpn.pages.profile.init();
// });