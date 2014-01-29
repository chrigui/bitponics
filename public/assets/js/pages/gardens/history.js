/**
 * Main file for /gardens/:id/history
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

  var app = angular.module('bpn.apps.gardens.history', ['bpn', 'ui', 'ui.bootstrap']);

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


  app.controller('bpn.controllers.gardens.history.Main', [
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
        }
      ],
      link: function (scope, element, attrs, controller) { 
        // link is where we have a created directive element as
        // well as populated scope to work with
        // element is a jQuery wrapper on the element

        

        function render () {
          element.empty();

          var sensorCode = scope.sensor.code;

          scope.sensorLogs = scope.sensorLogs || [];

          // var sensorReadings = scope.sensorLogs.map(function(sensorLog){
          //   return {
          //     val : sensorLog[sensorCode],
          //     ts : new Date(sensorLog.timestamp)
          //   }
          // });
          // sensorReadings = sensorReadings.filter(function(sensorReading){
          //   return (typeof sensorReading.val === 'number');
          // });
          // sensorReadings = sensorReadings.reverse();

          
          // Testing with random data
          var sensorReadings = [];
          var dateDiff = moment(scope.sharedDataService.endDate).toDate().valueOf() - scope.sharedDataService.startDate.toDate().valueOf();
          for (var i = 0; i < 1000; i++){
            // should start at starDate, each step should be 1/1000 of the way to endDate
            var randomTS = scope.sharedDataService.startDate.toDate().valueOf() + (i * (dateDiff / 1000));

            //scope.sharedDataService.startDate.toDate(), moment(scope.sharedDataService.endDate).toDate()
            sensorReadings.push({
              val : Math.floor(Math.random() * 2000),
              ts : randomTS
            });
          }


          var sensorReadingValues = sensorReadings.map(function(sensorReading){
            return sensorReading.val;
          });

          // console.log(scope.sensor.code, 'sensorReadings', sensorReadings);

          // Using "conventional margins" http://bl.ocks.org/mbostock/3019563
          // D3 Axis example: http://bl.ocks.org/mbostock/1166403

          var margin = {top: 10, right: 70, bottom: 30, left: 30},
              outerWidth = element.width(),
              width = outerWidth - margin.left - margin.right,
              outerHeight = 200,
              height = outerHeight - margin.top - margin.bottom,
              minY = d3.min(sensorReadingValues),
              maxY = d3.max(sensorReadingValues);
          
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
              console.log('xAxis.timeformat', xAxisScale.tickFormat());

          var yAxis = d3.svg.axis()
              .scale(yAxisScale)
              .ticks(5)
              .orient("right");

          var line = d3.svg.line()
              .x(function(d) { return xAxisScale(d.ts); })
              .y(function(d) { return yAxisScale(d.val); });


          var svg = d3.select(element[0])
            .append("svg")
            .attr("width", outerWidth)
            .attr("height", outerHeight)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


          //console.log('extent', d3.extent(sensorReadings, function(d) { return d.val; }))
          console.log('graphing', scope.sensor.code, [scope.sharedDataService.startDate.toDate(), moment(scope.sharedDataService.endDate).toDate()]);
          
          xAxisScale.domain([scope.sharedDataService.startDate.toDate(), moment(scope.sharedDataService.endDate).toDate()]);
          yAxisScale.domain(d3.extent(sensorReadings, function(d) { return d.val; }));


          svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);


          svg.append("g")
            .attr("class", "y axis")
            // Make the y-axis attached to the right
            .attr("transform", "translate(" + width + ",0)")
            .call(yAxis)
          
          svg.append("g")
          .append("text")
            .attr("transform", "rotate(-90),translate(0,-30)")
            .attr("y", 6)
            .attr("dy", ".8em")
            .style("text-anchor", "end")
            .text(scope.sensor.name); // axis label

          svg.append("path")
            .datum(sensorReadings)
            .attr("class", "line data-path")
            .attr("d", line);

          // var max=0, min=0, len=0;
          // min = d3.min(sensorReadings);
          // max = d3.max(sensorReadings);
          // len = sensorReadings.length;
          
          // // TODO : figure out how to make the size dynamic based on container
          // var h = 100,
          //     w = 750,
          //     p = 2,
          //     x = d3.scale.linear().domain([0, len]).range([p, w - p]),
          //     y = d3.scale.linear().domain([min, max]).range([h - p, p]),
          //     line = d3.svg.line()
          //            .x(function(d, i) { 
          //             console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
          //             // return the X coordinate where we want to plot this datapoint
          //             return x(i); 
          //            })
          //            .y(function(d) { 
          //               console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
          //               // return the Y coordinate where we want to plot this datapoint
          //               return y(d); 
          //            });

          // var svg = d3.select(element[0])
          //             .append("svg:svg")
          //             .attr("height", h)
          //             .attr("width", w);

          // var g = svg.append("svg:g");
          // g.append("svg:path")
          //  .attr("d", line(sensorReadings));
           //.attr("stroke", function(d) { return fill("hello"); });

          element.find('svg').mouseleave(function(event) {
            //handleMouseOutGraph(event);
            console.log("mouse leave");
          })
          element.find('svg').mousemove(function(event) {
            //handleMouseOverGraph(event);
            console.log("mouse move on graph");
          })  
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
    angular.bootstrap(document, ['bpn.apps.gardens.history']);
  });

  return app;
});