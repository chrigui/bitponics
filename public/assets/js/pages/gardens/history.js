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

      $scope.viewOptions = {
        timespan : 'All'
      };

      $scope.$watch('viewOptions.timespan', function(){
        switch($scope.viewOptions.timespan){
          case '24 hours':
          case '1 week':
          case 'All':
          default:
            //sharedDataService.startDate = moment().startOf('day');
            //sharedDataService.endDate = moment().endOf('day');
        }
        sharedDataService.getSensorLogs();
        sharedDataService.getTextLogs();
      });

      $scope.garden = sharedDataService.gardenModel;
   



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

          var sensorReadings = scope.sensorLogs.map(function(sensorLog){
            return {
              val : sensorLog[sensorCode],
              ts : new Date(sensorLog.timestamp)
            }
          });
          sensorReadings = sensorReadings.filter(function(sensorReading){
            return (typeof sensorReading.val === 'number');
          });
          sensorReadings = sensorReadings.reverse();

          var sensorReadingValues = sensorReadings.map(function(sensorReading){
            return sensorReading.val;
          });

          console.log(scope.sensor.code, 'sensorReadings', sensorReadings);

          var width = element.width(),
              height = 200,
              minY = d3.min(sensorReadingValues),
              maxY = d3.max(sensorReadingValues);
          
          var xAxisScale = d3.time.scale()
              .range([0, width]);

          var yAxisScale = d3.scale.linear()
              .range([height, 0]);

          var xAxis = d3.svg.axis()
              .scale(xAxisScale)
              .orient("bottom");

          var yAxis = d3.svg.axis()
              .scale(yAxisScale)
              .orient("left");

          var line = d3.svg.line()
              .x(function(d) { return xAxisScale(d.ts); })
              .y(function(d) { return yAxisScale(d.val); });


          var svg = d3.select(element[0])
            .append("svg")
            .attr("width", width)
            .attr("height", height);


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
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".8em")
            .style("text-anchor", "end")
            .text(scope.sensor.name); // axis label

          svg.append("path")
            .datum(sensorReadings)
            .attr("class", "line")
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
        }

        scope.$watch("sensorLogs", function(val) {
          render();
        });
      }
    };
  });



  domReady(function () {
    angular.bootstrap(document, ['bpn.apps.gardens.history']);
  });

  return app;
});