/*
 * Phase Graphs
 * - bpnDirectivesNavigationPhasesGraph -> UI for navigating through grow plan details
 * - bpnDirectivesPhasesGraph -> original phase graph on Dashboard
 */
define(['bpn.directives', 'jquery', 'd3'],
  function (bpnDirectives, $ ) {
    
    /*
     * Grow Plan navigation phase graph
     */
    bpnDirectives.directive('bpnDirectivesNavigationPhasesGraph', function(sharedDataService) {
      return {
        restrict : "EA",
        template : '<div class="phases-graph ring-graph circle centered"><div class="icon-glyph icon-glyphlogo-new icon-__62_logo_00e36c"></div></div>',
        replace : true,
        controller : function ($scope, $element, $attrs, $transclude){
          $scope.sharedDataService = sharedDataService;
          $scope.phases = $scope.sharedDataService.selectedGrowPlan.phases;
          $scope.phaseAddString = "Add Phase";
          $scope.getClasses = function(data, index){
            var className = 'good';
            // if (index == 0){ //first ring
            //   className += " good";
            // }
            // if (index != 0){ //all other rings
            //   className += " good";
            // }
            if (index == $scope.phases.length - 1) { //"add phase" ring (last)
              className += " add-phase"; 
            }
            if (index == $scope.sharedDataService.selectedPhaseIndex) {
              className += " active"; 
            }
            // console.log('index', index);
            // console.log('$scope.sharedDataService.selectedPhaseIndex in getCLasses',$scope.sharedDataService.selectedPhaseIndex);
            return className; 
          };

          $scope.$watch("sharedDataService.selectedPhaseIndex", function(newVal){
            d3.select($element[0]).selectAll('path')
            .attr('class', $scope.getClasses)
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

          $(element[0]).find('.icon-glyphlogo-new').css('font-size', $(element[0]).width()/15);

          scope.phases.push({ name: scope.phaseAddString });

          scope.$watch(function(){ return sharedDataService.selectedGrowPlan.phases; }, function (newVal, oldVal) {
            console.log('$watch3: scope.sharedDataService.selectedGrowPlan.phases.length', scope.sharedDataService.selectedGrowPlan.phases.length);
            var phases = scope.phases,
              phaseCount = phases.length,
              outerMargin = 0,
              width = $(element[0]).width() - (outerMargin * 2),
              height = width,
              radius = width / 2,
              innerWhitespaceRadius = radius / (phaseCount + 1),
              // sum of all arcSpans must fit between outer boundary and inner whitespace
              arcSpan = (radius - innerWhitespaceRadius) / (phaseCount + 1),
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
            var svgChild = svg.select('svg').remove();
            svg = d3.select(element[0])
              .append('svg:svg')
              .attr('width', width)
              .attr('height', height);

            // phases.push({ name: 'Add Phase' });

            phases.forEach(function(phase, index) {
              var arcNumber = ((phaseCount + 1) - index - 1),
                className = 'phase' + index,
                phaseGroup;
              
              scope.defaultArc = d3.svg.arc();

              scope.defaultArc.outerRadius(radius - (arcSpan * arcNumber) - arcMargin)
                .innerRadius(radius - (arcSpan * (arcNumber + 1)) - arcMargin);

              phaseGroup = svg.append('svg:g')
                .classed(className, true)
                .attr('transform', 'translate(' + (width / 2) + ',' + (width / 2) + ')');
              
              scope.allArcs = phaseGroup.selectAll('path')
                .data(equalPie([{}])); //empty ring

              scope.allArcs
                .enter()
                .append('svg:g')
                .append('svg:path')
                .attr('d', scope.defaultArc)
                .attr('class', scope.getClasses(null, index));

              //labels
              scope.allArcs
                .append("svg:text")
                .attr("fill", function(d, i) { return '#ffffff'; } )
                // .style({ 'fill': 'white', 'font-size': '20px'})
                // .attr("stroke", function(d, i) { return '#00F5A3'; } )
                .attr("transform", function(d) {
                  //we have to make sure to set these before calling arc.centroid
                  d.innerRadius = 0;
                  d.outerRadius = radius;
                  return "translate(" + scope.defaultArc.centroid(d) + ")";
                })
                .attr("text-anchor", "middle")
                .text(function(d, i) { return phase.name; });     

              scope.allArcs
                .on('click', function (d, i) {

                  scope.$apply(function(){
                      //phase navigation

                      scope.getClasses(null, index); //set active class
                      
                      scope.sharedDataService.selectedPhaseIndex = index;

                      if (phase.name !== scope.phaseAddString) { //filter out add phase ring
                        
                      } else {
                        var newPhaseObj = {
                          _id: index.toString() + '-' + (Date.now().toString()),
                          actionsViewModel:[],
                          idealRanges:[],
                          name: "Untitled"
                        };
                        scope.sharedDataService.selectedGrowPlan.phases.splice(phaseCount - 1, 0, newPhaseObj);
                        
                      }

                  });
                  
                });

              scope.allArcs.select('text').on('click', function(d, i) {
                console.log('clicked text');
              });


            });
            // debugger;
            // phases = null;
          }, true);
        }
      };
    });
    


    /*
     * Dashboard Phase Graph
     */
    bpnDirectives.directive('bpnDirectivesPhasesGraph', function() {
      return {
        restrict : "EA",
        template : '<div class="phases-graph ring-graph circle centered"><div class="icon-glyph icon-glyphlogo-new icon-__62_logo_00e36c"></div></div>',
        replace : true,
        controller : function ($scope, $element, $attrs, $transclude, sharedDataService){
          $scope.sharedDataService = sharedDataService;
          $scope.phases = $scope.sharedDataService.gardenModel.phases;
          
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

          scope.$watch('phases', function (newVal, oldVal) {
            var phases = scope.phases,
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