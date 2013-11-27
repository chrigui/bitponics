define(['angular', 'jquery', 'd3'],
  function (angular, $) {
    angular.module('bpn.directives.graphs', [])
    .directive('bpnDirectivesPhasesGraph', function() {
      return {
        restrict : "EA",
        template : '<div class="phases-graph ring-graph circle centered"><div class="icon-glyph icon-glyphlogo-new"></div></div>',
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
          $(element[0]).find('.icon-glyphlogo-new').css('font-size',$(element[0]).width()/15).click(function(e){
            e.preventDefault();
            scope.$apply(function(){
              scope.sharedDataService.targetActiveDate = new Date();
            });
          });

          scope.$watch('sharedDataService.growPlanInstance.phases', function (newVal, oldVal) {
            var phases = scope.sharedDataService.growPlanInstance.phases,
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
});