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
  bpn.pages.home = {
    
    MIN_SECTION_HEIGHT: 800,

    sectionPositions: {},

    screenHeight: undefined,
    screenWidth: undefined,

    init: function() {
      var self = this,
          screenHeight;

      //bring in separate pages
      bpn.utils.setupPages($('nav ul > li li:not([data-name="get-started"]) a:not([data-page-include="false"])'), function(){
        
        //match section height to window
        //create fixed nav
        self.screenWidth = $(window).width();
        if(self.screenWidth > 700){
          bpn.utils.sectionHeightAlign(self.MIN_SECTION_HEIGHT, '#main > .content-module');
        }

        //create fixed nav
        self.screenHeight = screenHeight = $(window).height() > self.MIN_SECTION_HEIGHT ? $(window).height() : self.MIN_SECTION_HEIGHT;
        self.sectionNavSetup(screenHeight);

        //smooth anchor scrolling to sections
        $('nav a:not([data-page-include="false"])').localScroll({
            onAfter: function(target){
              history.pushState({'target': target.id}, target.id, target.id);
            },
            lazy: true 
          });

        //TODO: get back/forward working with localscroll
        // $(window).bind('popstate', function(e){
        //   console.log(e.originalEvent.state.target)
        //   if(e.originalEvent.state.target){
        //     $(window).scrollTo($('#'+e.originalEvent.state.target));
        //   }
        // });

        //get section top values so we know when scrolling to highlight nav item
        $('#main > .content-module').each(function(i){

          //eval any page inline scripts (like Wufoo form scipt)
          $(this).find('div.script').each(function(){
            eval($(this).text())
          });

          self.sectionPositions[$(this).attr('id')] = $(this).position().top;

          
        });
      });

      //setup carousel
      // $('.flexslider').flexslider({
      //   animation: "slide",
      //   useCSS: true,
      //   slideshow: true,
      //   touch: true,
      //   directionNav: true,
      //   controlNav: false,
      //   //controlsContainer: '.flex-direction-nav',
      //   prevText: "",
      //   nextText: ""
      // });
      
      // //add prev/next icons
      // $('.flex-direction-nav .flex-prev').append('<i class="icon-glyph icon-glypharrow-2" aria-hidden="true"></i>')
      // $('.flex-direction-nav .flex-next').append('<i class="icon-glyph icon-glypharrow" aria-hidden="true"></i>')
      
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
            console.log('place: '+section)
            $('.header-fixed li').removeClass('active');
            $('.header-fixed li[data-name='+section+']').addClass('active');
          }
        };
      }, 0);
    }

  }

  $(function () {
    bpn.pages.home.init();
  });

});