define(['moment'], function(moment){
  this.bpn = this.bpn|| {};
  var utils = (this.bpn.utils = this.bpn.utils || {});


  /**
   *
   * @param str
   * @return {*}
   */
  utils.toTitleCase = function(str) {
    return str.replace(/(?:^|\s)\w/g, function(match) {
      return match.toUpperCase();
    });
  };


  /**
   * Generate an array with the times of day in :30 minute increments, along with milliseconds since start of day (00:00)
   */
  utils.generateTimesOfDayArray = function(){
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
  };


  /**
   *
   * @param n
   * @return {Boolean}
   */
  utils.isWholeNumber = function (n) {
    return n % 1 === 0;
  };


  /**
   *
   * @type {Array}
   */
  utils.durationTypes = ['seconds','minutes','hours','days','weeks','months'];


  /**
   * Takes a duration and returns the largest unit of time for which the duration is a whole number.
   * Used to simplify presentation of durations in UI (avoiding decimals).
   *
   * @param duration. Number. If durationType is omitted, it is assumed to be milliseconds.
   * @param durationType. String. One of Bitponics.Utils.durationTypes
   * @return { 'duration' : number, 'durationType' : string }
   */
  utils.getLargestWholeNumberDurationObject = function(duration, durationType){
    var duration = moment.duration(duration, durationType || ''),
      transformedDuration;
    if (utils.isWholeNumber(transformedDuration = duration.asMonths())) {
      return {
        duration : transformedDuration,
        durationType : 'months'
      }
    }
    if (utils.isWholeNumber(transformedDuration = duration.asWeeks())){
      return {
        duration : transformedDuration,
        durationType : 'weeks'
      }
    }
    if (utils.isWholeNumber(transformedDuration = duration.asDays())){
      return {
        duration : transformedDuration,
        durationType : 'days'
      }
    }
    if (utils.isWholeNumber(transformedDuration = duration.asHours())){
      return {
        duration : transformedDuration,
        durationType : 'hours'
      }
    }
    if (utils.isWholeNumber(transformedDuration = duration.asMinutes())){
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
  };


  /**
   *
   * @type {Object}
   */
  utils.accessoryValues = {
    ON : '1',
    OFF : '0'
  };

  return utils;
});
