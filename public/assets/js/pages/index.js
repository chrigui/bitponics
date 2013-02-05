/* Home Page */

define([
    'scrollto',
    'localscroll',
    'es5shim',
    'utils',
    'flexslider',
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
        $('#main > .content-module').each(function(i){
          if(i%2!=0){
            $(this).addClass('inverted-color');
          }
          self.sectionPositions[$(this).attr('id')] = $(this).position().top;
        });
      });

      //setup carousel
      $('.flexslider').flexslider({
        animation: "slide",
        useCSS: true,
        touch: true,
        directionNav: true,
        controlNav: false,
        prevText: "Previous",
        nextText: "Next"
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
          if(scrollTop >= secPos[section]){
            console.log('place: '+secPos[section])
            $('.header-fixed li').removeClass('active');
            $('.header-fixed li[data-name='+section+']').addClass('active');
          }
        };
      }, 0);
    }
  }

  $(function () {
    Bitponics.pages.home.init();
  });

});