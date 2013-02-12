/* Home Page */

define([
    'scrollto',
    'localscroll',
    'es5shim',
    'utils',
    'flexslider',
    // 'backstretch'
    ],
function(){
  Bitponics.pages.home = {
    
    MIN_SECTION_HEIGHT: 800,

    sectionPositions: {},

    screenHeight: undefined,
    screenWidth: undefined,

    init: function() {
      var self = this,
          screenHeight;

      //bring in separate pages
      Bitponics.Utils.setupPages($('nav ul > li a'), function(){
        
        //match section height to window
        //create fixed nav
        self.screenWidth = $(window).width();
        if(self.screenWidth > 600){
          Bitponics.Utils.sectionHeightAlign(self.MIN_SECTION_HEIGHT, '#main > .content-module');
        }

        //create fixed nav
        self.screenHeight = screenHeight = $(window).height() > self.MIN_SECTION_HEIGHT ? $(window).height() : self.MIN_SECTION_HEIGHT;
        self.sectionNavSetup(screenHeight);

        // self.setupSlideShow();

        //smooth anchor scrolling to sections
        $('nav a').localScroll({ lazy: true });  

        //get section top values so we know when scrolling to highlight nav item
        $('#main > .content-module').each(function(i){
          // if(i%2!=0){
          //   $(this).addClass('inverted-color');
          // }
          self.sectionPositions[$(this).attr('id')] = $(this).position().top;
        });
      });

      //setup carousel
      $('.flexslider').flexslider({
        animation: "slide",
        useCSS: true,
        slideshow: true,
        touch: true,
        directionNav: true,
        controlNav: false,
        //controlsContainer: '.flex-direction-nav',
        prevText: "",
        nextText: ""
      });
      
      //add prev/next icons
      $('.flex-direction-nav .flex-prev').append('<i class="icon-glyph icon-glypharrow-2" aria-hidden="true"></i>')
      $('.flex-direction-nav .flex-next').append('<i class="icon-glyph icon-glypharrow" aria-hidden="true"></i>')
      
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
    },

    setupSlideShow: function() {
      var self = this,
          b = $('.slides-container'),
          li = b.find('li'),
          n = li.length,
          src = [],
          cap = [];

      for (var i = 0; i < n; i++) {
          src[i] = $(li).eq(i).find('img').attr('src');
          cap[i] = $(li).eq(i).find('h2');
      };

      // initializing backstretch.js for background
      $(b).height(self.screenHeight);
      $(b).backstretch(src, {
        duration: 5000, 
        //centeredY: false,
        fade: 750
      });
      //$(b).data('backstretch').pause();
      
      
      $(b).after('<div class="caption"/>');
      $(li).css('opacity', '0');

      // coordinating image captions with slides
      $(window).on("backstretch.show", function (e, instance) {
        $('div.caption').fadeIn(750)
          .html(cap[instance.index])
          .delay(4000)
          .fadeOut(750);
      });

    }
  }

  $(function () {
    Bitponics.pages.home.init();
  });

});