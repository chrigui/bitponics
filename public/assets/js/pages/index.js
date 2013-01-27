/* Home Page */

define([
    '/assets/js/libs/jquery/jquery.scrollTo.min.js',
    '/assets/js/libs/jquery/jquery.localScroll.min.js',
    '/assets/js/libs/es5-shim.min.js',
    '/assets/js/shared/utils.js',
    ], 
function(){
  Bitponics.pages.home = {
    
    MIN_SECTION_HEIGHT: 800,

    sectionPositions: {},

    init: function() {
      var self = this,
          screenHeight;

      //bring in separate pages
      Bitponics.Utils.setupPages($('nav ul > li a'), function(){
        
        //match section height to window
        Bitponics.Utils.sectionHeightAlign(self.MIN_SECTION_HEIGHT, '#main > .content-module');

        //create fixed nav
        screenHeight = $(window).height() > self.MIN_SECTION_HEIGHT ? $(window).height() : self.MIN_SECTION_HEIGHT;
        self.sectionNavSetup(screenHeight);

        //smooth anchor scrolling to sections
        $('nav a').localScroll({ lazy: true });  

        //get section top values so we know when scrolling to highlight nav item
        $('#main > .content-module').each(function(){
          self.sectionPositions[$(this).attr('id')] = $(this).position().top;
        });

        console.log(self.sectionPositions)
      });
      
    },

    sectionNavSetup: function(screenHeight) {
      var self = this,
          headerFixed = $('.header:first').clone()
                            .addClass('header-fixed')
                            .attr('style', '')
                            .css({ 'top': screenHeight })
                            .attr('id', 'header-fixed')
                            .insertAfter('#home'),
          originalStyles = headerFixed.attr('style');
      
      $(window).scroll(function (event) {
        var y = $(this).scrollTop(),
            secPos = self.sectionPositions;

        if (y >= screenHeight) {
          headerFixed.attr('style', '').addClass('fixed');
          self.sectionNavHighlight(y, secPos);
        } else {
          headerFixed.attr('style', originalStyles).removeClass('fixed');
        }
      });
    },

    sectionNavHighlight: function(scrollTop, secPos) {
      var secPos = secPos;
      setTimeout(function(){
        var lastSection = 'home';
        for(var section in secPos){
          // console.log('secPos(lastSection): '+secPos[lastSection])
          // console.log('secPos(section): '+secPos[section])
          console.log('scrollTop: '+scrollTop)
          if(scrollTop >= secPos[section]){
            console.log('place: '+secPos[section])
            $('.header-fixed li').removeClass('active');
            $('.header-fixed li[data-name='+section+']').addClass('active');
          }
          // if(secPos[lastSection] <= y && y < secPos[section]){
          //   $('.header-fixed [data-name='+lastSection+']').addClass('active');
          //   lastSection = section;
          // }
        };
      }, 0);
    }
  }

  $(function () {
    Bitponics.pages.home.init();
  });

});