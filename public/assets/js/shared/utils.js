define(['moment'], function(moment){
  this.bpn = this.bpn|| {};
  var utils = (this.bpn.utils = this.bpn.utils || {});


  /**
   *
   * @param $navElements
   * @param callback
   */
  utils.setupPages = function($navElements, callback) {
    var self = this,
      includingPages = [];

    $navElements.each(function(){
      var $this = $(this),
        url = $this.attr('href').replace('/', '');

      $('#main').append('<div id="' + url + '" class="content-module middle"></div>');
      $this.attr('href', '/#'+url);

      includingPages.push(
        self.includePage({
          'url': url,
          'remoteSelector': '#main > *',
          'localElement': '#main > #' + url
        })
      );

    });

    if(callback){
      $.when.apply(null, includingPages).then(callback);
    }
  };


  /**
   *
   * @param settings
   * @return {*}
   */
  utils.includePage = function(settings) {

    return $.ajax({
      url: settings.url,
      dataType: 'html'
    })
      .success(function() { console.log('success'); })
      .error(function() { console.log('error'); })
      .complete(function(res, status) {
        if (status === 'success' || status === 'notmodified') {
          $(settings.localElement).append($(res.responseText).find(settings.remoteSelector).html());
        } else {
          console.log('bad response:');
          console.log(res.responseText);
        }
      });

  };


  /**
   *
   * @param minHeight
   * @param sectionSelector
   */
  utils.sectionHeightAlign = function(minHeight, sectionSelector) {
    var self = this,
      screenHeight = $(window).height() > minHeight ? $(window).height() : minHeight;

    $(sectionSelector).each(function(i) {
      var section = $(this);
      //sectionHeight = section.height();

      if (i == 0) {
        section.outerHeight(screenHeight);
      } else {
        setTimeout(function() {
          sectionHeight = section.height();
          if(sectionHeight < minHeight) {
            section.outerHeight(screenHeight);
          }
        }, 1000);
      }

    });

  };


  return utils;
});
