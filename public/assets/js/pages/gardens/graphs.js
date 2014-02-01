/**
 * Main file for /gardens/:id/graphs
 *
 * Depends on following globals:
 * - bpn
 * - bpn.user
 * - bpn.pageData.garden
 * - bpn.pageData.sensors
 * - bpn.pageData.controls
 */
require([
  'angular',
  'domReady',
  'view-models',
  'moment',
  'fe-be-utils',
  'd3',
  'angularUI',
  'angularUIBootstrap',
  'bpn',
  'bpn.directives.graphs',
  'bpn.services.garden',
  'bpn.services.photo',
  'bpn.services.socket',
],
function (angular, domReady, viewModels, moment, feBeUtils, d3) {
  'use strict';

  var app = angular.module('bpn.apps.gardens.graphs', ['bpn', 'ui', 'ui.bootstrap']);

  app.factory('sharedDataService', 
  [
    'GardenModel',
    'PhotosModel',
    'bpn.services.socket',
    '$http',
    '$q',
    function(GardenModel, PhotosModel, socket, $http, $q){
      var sharedData = this;
      
      sharedData.gardenModel = new GardenModel(bpn.pageData.garden);
      sharedData.cache = {};
      sharedData.startDate = moment(sharedData.gardenModel.startDate);
      sharedData.endDate = undefined;
      sharedData.sensorLogs = [];
      sharedData.textLogs = [];
      sharedData.viewOptions = {
        timespans : [
          '24 hours',
          '1 week',
          'All'
        ],
        selectedTimespan : '24 hours'
      };

      sharedData.sensors = bpn.pageData.sensors;
      sharedData.sensorsByCode = {};
      sharedData.sensors.forEach(function(sensor){
        sharedData.sensorsByCode[sensor.code] = sensor;
      });
      
      // TODO : once we populate visibleSensors for gardens in the database, 
      // change this to read from garden.visibleSensors
      sharedData.visibleSensors = sharedData.sensors;

      /**
       * Returns a an angular promise
       *
       * @return {Promise}
       */
      sharedData.getSensorLogs = function () {
        var deferred = $q.defer();

        $http.get(
          '/api/gardens/' + sharedData.gardenModel._id + '/sensor-logs',
          {
            params : {
              "start-date" : sharedData.startDate.format(),
              "end-date" : sharedData.endDate ? sharedData.endDate.format() : undefined
            }
          }
        )
        .success(function(data, status, headers, config) {
          
          sharedData.sensorLogs = viewModels.initSensorLogsViewModel(data.data);
     
          console.log('sensorLogs', sharedData.sensorLogs);
     
          deferred.resolve(data);
        })
        .error(function(data, status, headers, config) {
          deferred.reject(data);
        });

        return deferred.promise;
      };

      /**
       * Returns a an angular promise
       *
       * @return {Promise}
       */
      sharedData.getTextLogs = function () {
        var deferred = $q.defer();

        $http.get(
          '/api/gardens/' + sharedData.gardenModel._id + '/text-logs',
          {
            params : {
              "start-date" : sharedData.startDate ? sharedData.startDate.format() : undefined,
              "end-date" : sharedData.endDate ? sharedData.endDate.format() : undefined
            }
          }
        )
        .success(function(data, status, headers, config) {
          //sharedData.recentTextLogs = data.data;
          // sharedData.dateDataCache[dateKey].latestTextLogs = viewModels.initLatestSensorLogsViewModel(data.data);
          //sharedData.recentTextLogs.loaded = true;
          console.log('textLogs', data);
          deferred.resolve(data);
        })
        .error(function(data, status, headers, config) {
          deferred.reject(data);
        });

        return deferred.promise;
      };


      return sharedData;
    }
  ]);


  app.controller('bpn.controllers.gardens.graphs.Main', [
    '$scope',
    'sharedDataService',
    'GardenModel',
    function($scope, sharedDataService, GardenModel){
      
      $scope.sharedDataService = sharedDataService;

      $scope.garden = sharedDataService.gardenModel;

      $scope.viewOptions = sharedDataService.viewOptions;

      $scope.$watch('viewOptions.selectedTimespan', function(){
        switch($scope.viewOptions.selectedTimespan){
          case '24 hours':
            sharedDataService.startDate = moment().add('hours','-24');
            sharedDataService.endDate = moment();
            break;
          case '1 week':
            sharedDataService.startDate = moment().add('days','-7');
            sharedDataService.endDate = moment();
            break;
          case 'All':
          default:
            sharedDataService.startDate = moment(sharedDataService.gardenModel.startDate);
            sharedDataService.endDate = undefined;
            //sharedDataService.startDate = moment().startOf('day');
            //sharedDataService.endDate = moment().endOf('day');
        }
        sharedDataService.getSensorLogs();
        sharedDataService.getTextLogs();
      });


      $scope.init = function(){
        //sharedDataService.getSensorLogs(new Date());
      };


      $scope.init();
    }
  ]);




  app.directive('bpnDirectivesSensorGraph', function() { 
    return {
      restrict : "EA",
      replace : true,
      scope : {
        sensor : "=",
        sensorLogs : "=",
        sharedDataService : "="
      },
      template : '<div class="line-graph {{sensorCode}}"></div>',
      controller : [
        '$scope', '$element', '$attrs', '$transclude',
        function ($scope, $element, $attrs, $transclude){
          $scope.getLogDisplay = function(log){
            if (!log) { return ''; }
            return log.val + ' ' + $scope.sensor.unit + ' @ ' + moment(log.ts).format('MMMM Do YYYY, h:mm a');
          };
        }
      ],
      link: function (scope, element, attrs, controller) { 
        // link is where we have a created directive element as
        // well as populated scope to work with
        // element is a jQuery wrapper on the element

        // Using "conventional margins" http://bl.ocks.org/mbostock/3019563
        // D3 Axis example: http://bl.ocks.org/mbostock/1166403

        var sensorCode = scope.sensor.code,
            sensorLogs,
            sensorReadings,
            sensorReadingValues;

        var margin = {top: 30, right: 70, bottom: 30, left: 0},
            outerWidth = element.width(),
            width = outerWidth - margin.left - margin.right,
            outerHeight = 200,
            height = outerHeight - margin.top - margin.bottom;

        var xAxisScale = d3.time.scale()
              .range([0, width]);

        // TODO : yAxis should maybe use a threshold scale (http://bl.ocks.org/mbostock/4573883)
        // Thresholds would be the ideal range bounds
        var yAxisScale = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(xAxisScale)
            .tickSize(-height).tickSubdivide(true)
            .tickFormat(function(d){
              // the line below is equivalent to not specifying any tickFormat on xAxis
              return xAxisScale.tickFormat()(d);
            })
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(yAxisScale)
            .ticks(5)
            .orient("right");

        var line = d3.svg.line()
            //.interpolate("cardinal")
            .x(function(d) { 
              return !!d ? xAxisScale(d.ts) : undefined; 
            })
            .y(function(d) { 
              return !!d ? yAxisScale(d.val) : undefined; 
            });





        var svg = d3.select(element[0])
            .append("svg")
            .attr("width", outerWidth)
            .attr("height", outerHeight)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


          xAxisScale.domain([scope.sharedDataService.startDate.toDate(), moment(scope.sharedDataService.endDate).toDate()]);
          //yAxisScale.domain(d3.extent(sensorReadings, function(d) { return d.val; }));

          var xAxisElement = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);


          var yAxisElement = svg.append("g")
            .attr("class", "y axis")
            // Make the y-axis attached to the right
            .attr("transform", "translate(" + width + ",0)")
            .call(yAxis)
          
          var sensorLabel = svg.append("g")
            .append("text")
              //.attr("transform", "rotate(-90),translate(0,-30)")
              //.attr("y", 6)
              //.attr("dy", ".8em")
              //.style("text-anchor", "end")
              .attr("transform", "translate(0,-10)")
              .text(scope.sensor.name); // axis label

          var path = svg.append("path")
            //.datum(sensorReadings)
            .attr("class", "line data-path")
            //.attr("d", line);

          
          var focusGroup = svg.append("g"); //the vertical line across the plots


          var focusLine = focusGroup
            .append("line")
            .attr("class", "focus-line")
            .attr("x1", 0).attr("x2", 1) 
            .attr("y1", 0).attr("y2", height) 


          var focusPoint = focusGroup.append("circle")
              .attr("class", "focus-point")
              .attr("r", "5");
              //.attr("transform", "translate(" + line([sensorReadings[sensorReadings.length-1]]).replace('M','') + ")");


          var focusText = focusGroup
            .append("text")
              .attr("class", "focus-text")
              .attr("text-anchor", "end")
              .attr("transform", "translate(" + width + ",-10)")
              .text('');

          
          var offset = element.offset();
          offset.top = Math.round(offset.top);
          offset.left = Math.round(offset.left);

          element.find('svg')
            .on('mouseleave', function(e) {
              console.log("mouse leave");
            })
            .on('mousemove touchmove', function(e) {
              //console.log("mouse move on graph", e.pageX, e.pageY);
              var linePositionX = e.pageX - margin.left - offset.left;
              focusLine.attr("x1", linePositionX).attr("x2", linePositionX + 1);

              //console.log(linePositionX/width);

              var xAxisDate = xAxisScale.invert(linePositionX);
              console.log('xAxisDate', xAxisDate);
              var xAxisDateValue = xAxisDate.valueOf();

              // Find neighboring data points, then ge the closest
              var priorDataPoint, nextDataPoint;
              // for(var i = 0, length = sensorReadings.length; i < length; i++){
              //   console.log('iterating', i);
              //   nextDataPoint = sensorReadings[i];
              //   console.log(nextDataPoint.ts,xAxisDateValue);
              //   if (nextDataPoint.ts > xAxisDateValue){
              //     priorDataPoint = sensorReadings[i-1];
              //     console.log('found', i, nextDataPoint, priorDataPoint);
              //     break;
              //   }
              // }

              //console.log(sensorReadings.map(function(s){ return s.ts}), xAxisDateValue, feBeUtils.binaryIndexOf(sensorReadings.map(function(s){ return s.ts}), xAxisDateValue));

              var nextDataPointIndex = Math.abs(feBeUtils.binaryIndexOf(sensorReadings.map(function(s){ return s.ts}), xAxisDateValue));
              nextDataPoint = sensorReadings[nextDataPointIndex];
              priorDataPoint = sensorReadings[nextDataPointIndex - 1];
              
              var closestDataPoint;

              if (!priorDataPoint && !nextDataPoint){ 
                
              } else if (!priorDataPoint){
                closestDataPoint = nextDataPoint;
              } else if (!nextDataPoint){
                closestDataPoint = priorDataPoint;
              } else {
                var priorDiff = xAxisDateValue - priorDataPoint.ts,
                    nextDiff = nextDataPoint.ts - xAxisDateValue;
                closestDataPoint = priorDiff < nextDiff ? priorDataPoint : nextDataPoint;                
              }

              //console.log(closestDataPoint, closestDataPoint);  
              if (closestDataPoint){
                focusPoint.classed('active', true).attr("transform", "translate(" + line([closestDataPoint]).replace('M','') + ")");
                focusText.text(scope.getLogDisplay(closestDataPoint));
              }
            }
          );
        



        function render () {
          
          sensorLogs = scope.sensorLogs || [];

          sensorReadings = sensorLogs.filter(function(sensorLog){
            return (typeof sensorLog[sensorCode] === 'number');
          });

          sensorReadings = sensorReadings.map(function(sensorReading){
            return {
              val : sensorReading[sensorCode],
              ts : +(new Date(sensorReading.timestamp))
            }
          }).reverse();

          //console.log('sensorReadings', sensorReadings)
          
          // Testing with random data
          // sensorReadings = [];
          // var dateDiff = moment(scope.sharedDataService.endDate).toDate().valueOf() - scope.sharedDataService.startDate.toDate().valueOf();
          // for (var i = 0; i < 1000; i++){
          //   // should start at starDate, each step should be 1/1000 of the way to endDate
          //   var randomTS = Math.round(scope.sharedDataService.startDate.toDate().valueOf() + (i * (dateDiff / 1000)));

          //   //scope.sharedDataService.startDate.toDate(), moment(scope.sharedDataService.endDate).toDate()
          //   sensorReadings.push({
          //     val : Math.floor(Math.random() * 2000),
          //     ts : randomTS
          //   });
          // }


          sensorReadingValues = sensorReadings.map(function(sensorReading){
            return sensorReading.val;
          });

            
          xAxisScale.domain([scope.sharedDataService.startDate.toDate(), moment(scope.sharedDataService.endDate).toDate()]);
          yAxisScale.domain(d3.extent(sensorReadings, function(d) { return d.val; }));


          path.datum(sensorReadings).transition().duration(750).attr("d", line);

          var t = d3.transition()
            .duration(750)
            .ease('quad-in-out');

          t.each(function(){
            //path.attr("d", line);
            xAxisElement.call(xAxis);
            yAxisElement.call(yAxis);
          });
          

          focusPoint
            .attr("transform", "translate(" + line([sensorReadings[sensorReadings.length-1]]).replace('M','') + ")")
            .classed('active', !!sensorReadings.length);

          if (sensorReadings.length){
            focusText.text(scope.getLogDisplay(sensorReadings[sensorReadings.length-1]));
          }

        }


        scope.$watch("sensorLogs", function(val) {
          render();
        });

        scope.$watch("sharedDataService.viewOptions.selectedTimespan", function(val) {
          console.log('selectedTimespan', val);
        });
      }
    };
  });



  domReady(function () {
    angular.bootstrap(document, ['bpn.apps.gardens.graphs']);
  });

  return app;
});