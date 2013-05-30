require([
  'angular',
  'domReady',
  'moment',
  'fe-be-utils',
  'view-models',
  'spin',
  'angularResource',
  'd3',
  'es5shim',
  '/assets/js/services/socket.js',
  'overlay'
],
  function (angular, domReady, moment, feBeUtils, viewModels, Spinner) {
    'use strict';


    var dashboardApp = angular.module('bpn.apps.dashboard', ['ngResource', 'bpn.services']);


    dashboardApp.factory('sharedDataService', 
      [
        'bpn.services.socket',
        function(socket){
          var sharedData = {
            targetActiveDate : new Date(),
            activeDate : {},
            dateDataCache : {},  // Keyed by Date, contains { sensorLogs, latestSensorLogs, growPlanInstancePhase, growPlanPhase }
            socket : socket
          };

          socket.connect('/latest-grow-plan-instance-data');

          socket.emit('ready', { growPlanInstanceId : bpn.pageData.growPlanInstance._id });

          socket.on('update', function(data){
            //console.log("SOCKET UPDATE", data);
            var sensorLog = data.sensorLog,
                dateKey;
            if (sensorLog){
              sensorLog = viewModels.initSensorLogViewModel(sensorLog);
              dateKey = feBeUtils.getDateKey(sensorLog.timestamp);
              sharedData.dateDataCache[dateKey].sensorLogs.push(sensorLog);
              sharedData.dateDataCache[dateKey].latestSensorLogs = sensorLog;
            }
          });

          return sharedData;
        }
      ]
    );


    dashboardApp.factory('sensorLogsService', function(){
      // TODO : consolidate the get/post/caching mechanisms for /grow-plan-instances/:id/sensor-logs here
    });


    dashboardApp.controller('bpn.controllers.dashboard.Main',
      [
        '$scope',
        '$http',
        '$q',
        'sharedDataService',
        function ($scope, $http, $q, sharedDataService) {
          $scope.sharedDataService = sharedDataService;
          $scope.spinner = new Spinner({
            lines: 15, // The number of lines to draw
            length: 7, // The length of each line
            width: 7, // The line thickness
            radius: 3, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#00E36C', // #rgb or #rrggbb
            speed: 2.5, // Rounds per second
            trail: 44, // Afterglow percentage
            //shadow: true, // Whether to render a shadow
            hwaccel: true, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: 'auto', // Top position relative to parent in px
            left: 'auto' // Left position relative to parent in px
          }).spin();


          // First, transform the data into viewModel-friendly formats
          bpn.pageData.controls.forEach(function (control) {
            viewModels.initControlViewModel(control);
          });

          viewModels.initGrowPlanInstanceViewModel(bpn.pageData.growPlanInstance, bpn.pageData.controls);

          viewModels.initSensorLogsViewModel(bpn.pageData.latestSensorLogs);
          
          
          
          /**
           * Returns a an angular promise
           *
           * @return {Promise}
           */
          $scope.getSensorLogsByDate = function (dateKey) {
            var dateMoment = moment(dateKey),
                deferred = $q.defer();

            $http.get(
              '/api/grow-plan-instances/' + $scope.growPlanInstance._id + '/sensor-logs',
              {
                params : {
                  "start-date" : feBeUtils.getDateKey(dateMoment),
                  "end-date" : feBeUtils.getDateKey(dateMoment.add('days', 1))
                }
              }
            )
            .success(function(data, status, headers, config) {
              $scope.sharedDataService.dateDataCache[dateKey].sensorLogs = viewModels.initSensorLogsViewModel(data.data);
              $scope.sharedDataService.dateDataCache[dateKey].latestSensorLogs = data.data[0];
              $scope.sharedDataService.dateDataCache[dateKey].loaded = true;
              deferred.resolve(data);
            })
            .error(function(data, status, headers, config) {
              deferred.reject(data);
            });

            return deferred.promise;
          };


          /**
           *
           */
          $scope.triggerImmediateAction = function(actionId){
            $http.post(
              '/api/grow-plan-instances/' + $scope.growPlanInstance._id + '/immediate-actions',
              {
                actionId : actionId,
                message : "Triggered from dashboard"
              }
            )
            .success(function(data, status, headers, config) {
              console.log(data);
            })
            .error(function(data, status, headers, config) {
              console.log(data);
            });
          }

          // Set up functions and watchers

          $scope.getGrowPlanInstancePhaseFromDate = function (date) {
            var dateMoment = moment(date),
              growPlanInstancePhases = $scope.growPlanInstance.phases,
              i,
              phaseStart;

            for (i = growPlanInstancePhases.length; i--;) {
              phaseStart = growPlanInstancePhases[i].startDate;
              if (dateMoment.isAfter(phaseStart)) {
                return growPlanInstancePhases[i];
              }
            }
            return growPlanInstancePhases[0];
          };


          /**
           * Based on activeDate, refresh the latest sensor logs & control actions
           *
           * @param {Date|String} date
           */
          $scope.displayDate = function (date) {
            // May get either a date object or a string, so use moment to clean up
            var dateMoment = moment(date),
                dateKey = feBeUtils.getDateKey(dateMoment);

            if ($scope.sharedDataService.dateDataCache[dateKey]){
              $scope.sharedDataService.activeDate = $scope.sharedDataService.dateDataCache[dateKey];
            } else {
              $scope.sharedDataService.dateDataCache[dateKey] = {};
              $scope.sharedDataService.dateDataCache[dateKey].growPlanInstancePhase = $scope.getGrowPlanInstancePhaseFromDate(date);
              $scope.sharedDataService.dateDataCache[dateKey].growPlanPhase = $scope.sharedDataService.dateDataCache[dateKey].growPlanInstancePhase.phase;
              $scope.sharedDataService.dateDataCache[dateKey].date = dateMoment.toDate();
              $scope.sharedDataService.dateDataCache[dateKey].dateKey = dateKey;
              $scope.getSensorLogsByDate(dateKey);
              
              $scope.sharedDataService.activeDate = $scope.sharedDataService.dateDataCache[dateKey];
            }
          };


          $scope.$watch('sharedDataService.activeDate.loaded', function (newValue) {
            if (newValue) {
              $scope.spinner.stop();
            } else {
              $('#sensors h2').append($scope.spinner.el);
            }
          });


          $scope.$watch('sharedDataService.targetActiveDate', function (newVal, oldVal) {
            $scope.displayDate($scope.sharedDataService.targetActiveDate);
          });

          // Finally, set the scope models
          $scope.controls = bpn.pageData.controls;
          $scope.sensors = bpn.pageData.sensors;
          $scope.growPlanInstance = bpn.pageData.growPlanInstance;
          $scope.latestSensorLogs = bpn.pageData.latestSensorLogs;
          
        }
      ]
    );


    dashboardApp.controller('bpn.controllers.dashboard.DayOverview',
      [
        '$scope',
        function ($scope) {
          // TODO: Add functions to handle interactions on anything in the DayOverview sidebar (clicks to open sensor detail overlay)

          $scope.getIdealRangeForSensor = function (sensor, date) {
            var idealRanges = $scope.sharedDataService.activeDate.growPlanPhase.idealRanges,
              idealRange,
              i,
              timeOfDayInMilliseconds,
              applicableTimeSpan;
            
            for (i = idealRanges.length; i--;) {
              idealRange = idealRanges[0];
              applicableTimeSpan = idealRange.applicableTimeSpan;

              if (idealRange.sCode === sensor.code) {
                if (applicableTimeSpan && date){
                  // get the localized time of day for the sensor log
                  // calling new Date(anything) in a browser will give the localized time.
                  // our dates are stored with a UTC timestamp, so we good
                  sensorReading = sensorLog[sensor.code];
                  sensorLogTimeOfDayInMilliseconds = feBeUtils.getTimeOfDayInMilliseconds(date);

                  // Handle regular span vs overnight span
                  if (applicableTimeSpan.startTime < applicableTimeSpan.endTime) {
                    if ( (timeOfDayInMilliseconds >= applicableTimeSpan.startTime) && (timeOfDayInMilliseconds <= applicableTimeSpan.endTime) ){
                      return idealRange;
                    }
                  } else {
                    // overnight span
                    // time can be after startTime or before endTime
                    if ( (timeOfDayInMilliseconds >= applicableTimeSpan.startTime) || (timeOfDayInMilliseconds<= applicableTimeSpan.endTime) ){
                      return idealRange;
                    }
                  }
                } else {
                  return idealRange;  
                }
              }
            }
          };


          $scope.getSensorBlockClassNames = function (sensor, sensorLog) {
            var sensorCode = sensor.code,
              classNames = ['sensor', 'data-module', sensorCode],
              idealRange,
              sensorValue,
              sensorTimestamp;

            if (sensorLog){
               sensorValue = sensorLog[sensorCode];
               sensorTimestamp = sensorLog.timestamp;
               idealRange = $scope.getIdealRangeForSensor(sensor, new Date(sensorLog.timestamp));
            }

            // Determine whether we need to add the "warning" class
            if (idealRange) {
              if ((sensorValue < idealRange.valueRange.min) ||
                  (sensorValue > idealRange.valueRange.max)
                ) {
                classNames.push('warning');
              }
            }

            if (typeof sensorValue === 'undefined') {
              classNames.push('warning');
            }

            return classNames.join(' ');
          };
        }
      ]
    );


    dashboardApp.controller('bpn.controllers.dashboard.PhasesGraph',
      [
        '$scope',
        function ($scope) {
        }
      ]
    );


    dashboardApp.controller('bpn.controllers.dashboard.Controls',
      [
        '$scope',
        function ($scope) {
          // TODO: Add functions to handle interactions with control widgets. Launch control overlay.
        }
      ]
    );


    dashboardApp.controller('bpn.controllers.dashboard.Notifications',
      [
        '$scope',
        function ($scope) {

        }
      ]
    );


    dashboardApp.controller('bpn.controllers.dashboard.SensorDetailOverlay',
      [
        '$scope',
        function ($scope) {

          $scope.drawSparkGraph = function (svgCont, setData, idealLow, idealHigh, belowResolution) {
            var width = 400;
            var height = 100;

            var yExtent = d3.extent(setData, function (d) { return d.value; });

            var xScale = d3.scale.linear()
              .domain(d3.extent(setData, function (d) {
              return d.time;
            }));
            xScale.range([0, width]);
            //.nice();      

            var yScale = d3.scale.linear()
              .domain(d3.extent(setData, function (d) { return d.value; }))
              .range([height, 0]);

            var yColorScale = d3.scale.linear()
              .domain([yExtent[0], idealLow, idealLow, idealHigh, idealHigh, yExtent[1]])
              .range(['red', 'red', 'green', 'green', 'red', 'red']);

            var line = d3.svg.line()
              .x(function (d) {
                return xScale(d.time);
              })
              .y(function (d) {
                return yScale(d.value);
              });

            var sparkGraph = d3.select(svgCont)
              .append('svg:svg')
              .attr('width', width)
              .attr('height', height);

            var arraySections = [];
            var curArr = [];

            var crossTime = '';
            var crossPercent = '';
            var crossPoint = '';

            var testScale = d3.scale.linear()
              .domain([yExtent[0], idealLow - belowResolution, idealLow, idealHigh, idealHigh + belowResolution, yExtent[1]])
              .range(['low', 'low', 'normal', 'normal', 'high', 'high']);

            for (var i = 0; i < setData.length; i++) {
              if (curArr.length == 0) {
                curArr.push(setData[i]);
              } else {
                if (testScale(setData[i - 1].value) != testScale(setData[i].value)) {
                  if ((testScale(setData[i - 1].value) == 'low' || testScale(setData[i - 1].value) == 'normal') && (testScale(setData[i].value) == 'low' || testScale(setData[i].value) == 'normal')) {
                    crossPercent = Math.abs(idealLow - setData[i - 1].value) / Math.abs(setData[i].value - setData[i - 1].value)
                    crossTime = ((setData[i].time - setData[i - 1].time) * crossPercent ) + setData[i - 1].time;

                    crossPoint = {'time':crossTime, 'value':idealLow - belowResolution};
                  } else if ((testScale(setData[i - 1].value) == 'high' || testScale(setData[i - 1].value) == 'normal') && (testScale(setData[i].value) == 'high' || testScale(setData[i].value) == 'normal')) {
                    crossPercent = Math.abs(idealHigh - setData[i - 1].value) / Math.abs(setData[i].value - setData[i - 1].value)
                    crossTime = ((setData[i].time - setData[i - 1].time) * crossPercent ) + setData[i - 1].time;

                    crossPoint = {'time':crossTime, 'value':idealHigh + belowResolution};
                  } else {
                    console.log("NOT SUPPOSED TO!! i-1 " + testScale(setData[i - 1].value) + " i " + testScale(setData[i - 1].value));
                  }

                  curArr.push(crossPoint);
                  arraySections.push(curArr);
                  curArr = [];
                  curArr.push(crossPoint);
                  curArr.push(setData[i]);
                } else {
                  curArr.push(setData[i]);
                }
              }
            }

            arraySections.push(curArr);

            sparkGraph
              .append('line')
              .attr('x1', 0)
              .attr('y1', yScale(idealLow))
              .attr('x2', width)
              .attr('y2', yScale(idealLow))
              .attr('stroke-width', 1)
              .attr('stroke', 'black');

            sparkGraph
              .append('line')
              .attr('x1', 0)
              .attr('y1', yScale(idealHigh))
              .attr('x2', width)
              .attr('y2', yScale(idealHigh))
              .attr('stroke-width', 1)
              .attr('stroke', 'black');


            sparkGraph.selectAll('path')
              .data(arraySections)
              .enter().append("path")
              .attr('stroke', function (d, i) {
                return yColorScale(d[1].value);
              })
              .attr('fill', 'none')
              .attr('stroke-width', '1')

              .attr("d", line);

            /*sparkGraph.append("path")
             .datum(setData)
             //.attr("class", "line")
             .attr('stroke', 'red')
             .attr('fill', 'none')
             .attr('stroke-width', '1')
             .attr("d", line);*/
          };
        }
      ]
    );


    dashboardApp.directive('bpnDirectivesPhasesGraph', function() {
      return {
        restrict : "EA",
        template : '<div class="phases-graph ring-graph circle centered"></div>',
        replace : true,
        controller : function ($scope, $element, $attrs, $transclude, sharedDataService){
          $scope.sharedDataService = sharedDataService;
          
          $scope.getDaySummaryClass = function(data){
            var className = data.data.status;
            if (data.data.dateKey === $scope.sharedDataService.activeDate.dateKey){
              className += " active";
            }
            return className;
          }

          $scope.$watch("sharedDataService.activeDate.dateKey", function(newVal){
            d3.select($element[0]).selectAll('path')
            .attr('class', $scope.getDaySummaryClass)
            .each(function(d, i){
              /*
              if (d.data.dateKey === $scope.sharedDataService.activeDate.dateKey){
                var angle = d.startAngle + ((d.endAngle - d.startAngle) / 2);
                d3.select(this).attr('transform', 'translate(' + arc.centroid(d) + ') rotate(' + ( (angle * (180/Math.PI)) + 45) + ')');
                
              } else {
                d3.select(this).attr('transform', '');
              }
              */
            });
          });
        },
        link: function (scope, element, attrs, controller) {
          scope.$watch('growPlanInstance.phases', function (newVal, oldVal) {
            var phases = scope.growPlanInstance.phases,
              phaseCount = phases.length,
              outerMargin = 80,
              width = $(element[0]).width() - (outerMargin * 2),
              height = width,
              radius = width / 2,
              innerWhitespaceRadius = radius / (phaseCount + 1),
              // sum of all arcSpans must fit between outer boundary and inner whitespace
              arcSpan = (radius - innerWhitespaceRadius) / phaseCount,
              arcMargin = 0,
              colorScale = d3.scale.category20c(),
              equalPie = d3.layout.pie();


            // disable data sorting & force all slices to be the same size
            equalPie
              .sort(null)
              .value(function (d) {
                return 1;
              });

            var svg = d3.select(element[0])
              .append('svg:svg')
              .attr('width', width)
              .attr('height', height);

            phases.forEach(function(phase, index) {
              var arcNumber = (phaseCount - index - 1),
                arc = d3.svg.arc(),
                className = 'phase' + index,
                phaseGroup;

              arc.outerRadius(radius - (arcSpan * arcNumber) - arcMargin)
                .innerRadius(radius - (arcSpan * (arcNumber + 1)) - arcMargin);

              phaseGroup = svg.append('svg:g')
                .classed(className, true)
                .attr('transform', 'translate(' + (width / 2) + ',' + (width / 2) + ')');

              var allArcs = phaseGroup.selectAll('path')
                .data(equalPie(phase.daySummaries));

              allArcs
                .enter()
                .append('svg:g')
                .append('svg:path')
                .attr('d', arc)
                .attr('class', scope.getDaySummaryClass);

              allArcs
                .on('click', function (d, i) {
                  // Have to wrap this in a scope.$apply call because it occurs outside of the 
                  // Angular lifecycle, need to tell angular that it should refresh itself
                  scope.$apply(function(){
                    scope.sharedDataService.targetActiveDate = d.data.dateKey;
                  });
                  
                  //var barberPoleCont = $('.barberPoleCont');
                  //var barberPolePattern = $('.barberPolePattern');
                  //var angle = d.startAngle + ((d.endAngle - d.startAngle) / 2);
                  //var centroidX = arc.centroid(d)[0] + width / 2;
                  //var centroidY = arc.centroid(d)[1] + width / 2;

                  //barberPolePattern.attr('transform', 'rotate(' + (Math.degrees(angle) + 45) + ')');

                  //barberPole.attr('transform', 'translate(' + centroidX + ',' + centroidY + ') rotate(' + (Math.degrees(angle) + 45) + ')');
                  //barberPoleCont.css('mask', 'url(#mask-' + $(this).attr('id') + ')');
                  //barberPoleCont.attr('transform', 'translate(' + (width / 2) + ',' + (width / 2) + ')');


                  //console.log("WIDTH " + width);

                  //barberPole.attr('transform', 'translate(' + arc.centroid(d) + ') rotate(' + (Math.degrees(angle) + 45) + ')');
                });

              /*
              var maskGroup = svg.append('defs')
                .append('g')
                .attr('transform', 'translate(' + (width / 2) + ',' + (width / 2) + ')');

              var allMasks = maskGroup.selectAll('mask')
                .data(equalPie(phase.daySummaries));

              allMasks
                .enter()
                .append('svg:mask')
                .append('svg:path')
                .attr('d', arc)
                .attr('class', $scope.getPhaseClass);
              */
            });
          });
        }
      };
    });



    dashboardApp.directive('bpnDirectivesControlActionGraph', function() { 
      return {
        restrict : "EA",
        template : '<div class="control ring-graph {{controlAction.control.className}}"></div>',
        replace : true,
        scope : {
          controlAction : "="
        },
        controller : function ($scope, $element, $attrs, $transclude){
          $scope.getPathClassName = function (data, index) {
            var num = parseInt(data.data.value, 10);

            if (num == 0) {
              return 'off';
            } else {
              return 'on';
            }
          };


        },
        link: function (scope, element, attrs, controller) { 
          // link is where we have a created directive element as
          // well as populated scope to work with
          // element is a jQuery wrapper on the element

          var outerMargin = 0,
              width = element.width() - (outerMargin * 2),
              height = width,
              radius = width / 2,
              innerWhitespaceRadius = radius / 2,
              arcSpan = (radius - innerWhitespaceRadius),
              arcMargin = 0,
              colorScale = d3.scale.category20c(),
              pie = d3.layout.pie(),
              dayMilliseconds = 24 * 60 * 60 * 1000,
              svg,
              arc,
              className,
              svgGroup,
              cycleStates,
              cyclesInADay,
              cycleGraphData = [],
              i;

          // disable data sorting & force all slices to be the same size
          pie
          .sort(null)
          .value(function (d) {
            return d.milliseconds || 1; // don't allow a 0 duration. d3 can't draw it
          });

          svg = d3.select(element[0])
          .append('svg:svg')
          .attr('width', width)
          .attr('height', height);

          arc = d3.svg.arc();
          className = 'control-' + scope.controlAction.control.className;

          cycleStates = scope.controlAction.cycle.states.map(function(state){
            return {
              value : parseInt(state.controlValue, 10),
              milliseconds : moment.duration(state.duration || 0, state.durationType || '').asMilliseconds()
            }
          });

          if (scope.controlAction.overallDurationInMilliseconds === 0){
            // then it's a single-state cycle with no duration (aka, just set to VALUE and leave forever)
            cyclesInADay = 1;
          } else {
            cyclesInADay = dayMilliseconds / scope.controlAction.overallDurationInMilliseconds;
          }
          
          for (i = 0; i < cyclesInADay; i++) {
            cycleGraphData = cycleGraphData.concat(cycleStates);
          }

          arc
          .outerRadius(radius - arcMargin)
          .innerRadius(radius - arcSpan - arcMargin);

          svgGroup = svg.append('svg:g')
          .classed(className, true)
          .attr('transform', 'translate(' + (width / 2) + ',' + (width / 2) + ')');          

          svgGroup.selectAll('path')
          .data(pie(cycleGraphData))
          .enter()
          .append('svg:path')
          .attr('d', arc)
          .attr('class', scope.getPathClassName)
          //.attr('stroke', '#fff')
          //.attr('stroke-width', 1)
          //.attr('fill', scope.getControlFillColor)
          
        }
      };
    });




    domReady(function () {
      angular.bootstrap(document, ['bpn.apps.dashboard']);
    });




  });






















/*

// Kyle's code

$scope.getPhaseClass = function (data, index) {
            var status = data.data.status;

            switch(status){
              case feBeUtils.PHASE_DAY_SUMMARY_STATUSES.GOOD : 
                return "good";
              case feBeUtils.PHASE_DAY_SUMMARY_STATUSES.GOOD : 
                return "bad";
              default : 
                return "empty";
            }
          };

          $scope.drawBarSet = function (target, barWidth, barLength, barSpacing, numBars) {
            var svg,
              startLoc = 0,
              totalHeight = ((barWidth * numBars) + (barSpacing * (numBars - 1))),
            //startLoc = ((barWidth*numBars) + (barSpacing*numBars))/-2,
              bar,
              barGroup;

            svg = d3.select(target).append('svg:g').attr('class', 'barberPoleCont');

            barGroup = svg
              .attr('width', barLength)
              .attr('height', ((barWidth * numBars) + (barSpacing * (numBars - 1))))
              .append('svg:g')
              .attr('class', 'barberPolePattern');

            for (var i = 0; i < numBars; i++) {
              barGroup
                .append("svg:rect")
                .attr('x', (barLength / -2))
                .attr('y', ((startLoc + (barWidth * i) + (barSpacing * i)) + (totalHeight / -2)  ))
                .attr('width', barLength)
                .attr('height', barWidth);
            }
          };



$scope.makeDayProgressClock = function (svg, radius, triangleSize) {
            var triHeight = Math.cos(Math.PI / 6) * triangleSize,
              width = svg.clientWidth,
              height = svg.clientHeight;

            var circleCont = d3.select(svg)
              .append('svg:g')
              .attr('class', 'timeProgressThumb')
              .attr('width', width)
              .attr('height', height)
              //.attr("transform", "rotate(90, 250, 250)")
              .append("svg:polygon")
              .attr('stroke', 'black')
              .attr("points", width / 2 + "," + radius + " " + ((width / 2) + (triangleSize / 2)) + "," + (triHeight + radius) + " " + ((width / 2) - (triangleSize / 2)) + "," + (triHeight + radius));
          };


*/

