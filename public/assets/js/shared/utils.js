define(['moment'], function(moment){
  this.Bitponics = this.Bitponics || {};
  Bitponics.Utils = {
    
    toTitleCase: function(str) {
      return str.replace(/(?:^|\s)\w/g, function(match) {
          return match.toUpperCase();
      });
    },

    setupPages: function($navElements, callback) {
      var self = this,
          includingPages = [];
      
      $navElements.each(function(){
          var $this = $(this),
              url = $this.attr('href').replace('/', '');

          $('#main').append('<div id="' + url + '" class="content-module middle"></div>');
          $this.attr('href', '#'+url);

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

    },

    includePage: function(settings) {

        return $.ajax({
              url: settings.url,
              dataType: 'html'
          })
          .success(function() { console.log('success'); })
          .error(function() { console.log('error'); })
          .complete(function(res, status) {
              if (status === 'success' || status === 'notmodified') {
                $(settings.localElement).append($(res.responseText).find(settings.remoteSelector));
              } else {
                console.log('bad response:');
                console.log(res.responseText);
              }
          });

    },

    sectionHeightAlign: function(minHeight, sectionSelector) {
      var self = this,
          screenHeight = $(window).height() > minHeight ? $(window).height() : minHeight;
      
      $(sectionSelector).each(function(i) {
        var section = $(this),
            sectionHeight = section.height();
        
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
        
    },

    /**
     * Generate an array with the times of day in :30 minute increments, along with milliseconds since start of day (00:00)
     */
    generateTimesOfDayArray : function(){
      var result = [], min = 0, hr = 0, minStr, hrStr, hrInc = 0;

      for (; hrInc < 24;){
        hr = Math.floor(hrInc);
        hrStr = (hr < 10 ? '0' + hr : hr);
        hrStr = (hr > 12 ? (hr - 12) : (hr == 0 ? '12' : hr));
        var suffix = (hr < 12 ? 'am' : 'pm');
        minStr = min < 10 ? '0' + min : min;
        result.push({
          "ms": ((min * 60 * 1000) + (hr * 60 * 60 * 1000)),
          "str": hrStr + ':' + minStr + suffix
        });
        min = (min == 0 ? 30 : 0);
        hrInc += .5;
      }
      return result;
    },

    isWholeNumber: function (n) {
       return n % 1 === 0;
    },

    durationTypes : ['seconds','minutes','hours','days','weeks','months'],


    /**
     * Takes a duration and returns the largest unit of time for which the duration is a whole number.
     * Used to simplify presentation of durations in UI (avoiding decimals).
     *
     * @param duration. Number. If durationType is omitted, it is assumed to be milliseconds.
     * @param durationType. String. One of Bitponics.Utils.durationTypes
     * @return { 'duration' : number, 'durationType' : string }
     */
    getLargestWholeNumberDurationObject : function(duration, durationType){
      var duration = moment.duration(duration, durationType || ''),
        transformedDuration;
      if (Bitponics.Utils.isWholeNumber(transformedDuration = duration.asMonths())) {
            return {
              duration : transformedDuration,
              durationType : 'months'
            }
        }
        if (Bitponics.Utils.isWholeNumber(transformedDuration = duration.asWeeks())){
            return {
              duration : transformedDuration,
              durationType : 'weeks'
            }
      }
      if (Bitponics.Utils.isWholeNumber(transformedDuration = duration.asDays())){
            return {
              duration : transformedDuration,
              durationType : 'days'
            }
      }
      if (Bitponics.Utils.isWholeNumber(transformedDuration = duration.asHours())){
            return {
              duration : transformedDuration,
              durationType : 'hours'
            }
      }
      if (Bitponics.Utils.isWholeNumber(transformedDuration = duration.asMinutes())){
            return {
              duration : transformedDuration,
              durationType : 'minutes'
            }
      }
      // if all fail, return as seconds
      transformedDuration = duration.asSeconds();
          return {
          duration : transformedDuration,
          durationType : 'seconds'
        }
    },

    accessoryValues : {
      ON : '1',
      OFF : '0'
    }
  }

  return Bitponics.Utils;
});
