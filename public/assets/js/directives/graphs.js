/*
 * Phase Graphs
 * - bpnDirectivesNavigationPhasesGraph -> UI for navigating through grow plan details
 * - bpnDirectivesPhasesGraph -> original phase graph on Dashboard
 *
 * Depends on following globals:
 * bpn.sensors
 */
define(['bpn.directives', 'jquery', 'view-models', 'd3'],
  function (bpnDirectives, $, viewModels) {
    
    /*
     * Grow Plan navigation phase graph
     */
    bpnDirectives.directive('bpnDirectivesNavigationPhasesGraph', 
      [
        'sharedDataService',
        function(sharedDataService) {
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
                    phaseGroup,
                    startArc = d3.svg.arc(),
                    completeArc = d3.svg.arc(),
                    allArcs;
                  
                  
                  completeArc.outerRadius(radius - (arcSpan * arcNumber) - arcMargin)
                    .innerRadius(radius - (arcSpan * (arcNumber + 1)) - arcMargin);


                  startArc.outerRadius(completeArc.innerRadius()).innerRadius(completeArc.innerRadius());

                  phaseGroup = svg
                    .append('svg:g')
                    .classed(className, true)
                    .attr('transform', 'translate(' + (width / 2) + ',' + (width / 2) + ')');
                  
                  allArcs = phaseGroup.selectAll('path')
                    .data(equalPie([{}])); //empty ring

                  if (scope.userInteracted) {
                    allArcs
                      .enter()
                      .append('svg:g')
                      .append('svg:path')
                      .attr('d', completeArc)
                      .attr('class', scope.getClasses(null, index));
                  } else {
                    allArcs
                      .enter()
                      .append('svg:g')
                      .append('svg:path')
                      .attr('d', startArc)
                      .attr('class', scope.getClasses(null, index))
                      .transition()
                      .duration(500)
                      .ease('quad-in-out')
                      .delay(500 * (index + 1))
                      .attr('d', completeArc);
                  }

                  //labels
                  allArcs
                    .append("svg:text")
                    .attr("fill", function(d, i) { return '#ffffff'; } )
                    .attr("transform", function(d) {
                      //we have to make sure to set these before calling arc.centroid
                      d.innerRadius = 0;
                      d.outerRadius = radius;
                      return "translate(" + completeArc.centroid(d) + ")";
                    })
                    .attr("text-anchor", "middle")
                    .text(function(d, i) { return phase.name; });     

                  allArcs
                    .on('click', function (d, i) {

                      scope.$apply(function(){
                          //phase navigation
                          scope.userInteracted = true;
                          scope.getClasses(null, index); //set active class
                          
                          scope.sharedDataService.selectedPhaseIndex = index;

                          if (phase.name !== scope.phaseAddString) { //filter out add phase ring
                            
                          } else {
                            var newPhaseObj = viewModels.initGrowPlanPhaseViewModel(
                              {
                                _id: index.toString() + '-' + (Date.now().toString()),
                                actions:[],
                                phaseEndActions : [],
                                idealRanges:[],
                                nutrients:[],
                                
                                name: "Untitled"
                              },
                              bpn.sensors
                            );
                            scope.sharedDataService.selectedGrowPlan.phases.splice(phaseCount - 1, 0, newPhaseObj);
                            
                          }

                      });
                      
                    });

                  allArcs.select('text').on('click', function(d, i) {
                    console.log('clicked text');
                  });


                });
                // debugger;
                // phases = null;
              }, true);
            }
          };
        }
      ]
    );
    


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
                startArc = d3.svg.arc(),
                completeArc = d3.svg.arc(),
                className = 'phase' + index,
                phaseGroup;

              completeArc.outerRadius(radius - (arcSpan * arcNumber) - arcMargin)
                .innerRadius(radius - (arcSpan * (arcNumber + 1)) - arcMargin);

              startArc.outerRadius(completeArc.innerRadius()).innerRadius(completeArc.innerRadius());

              phaseGroup = svg.append('svg:g')
                .classed(className, true)
                .attr('transform', 'translate(' + (width / 2) + ',' + (width / 2) + ')');
              
              var allArcs = phaseGroup.selectAll('path')
                .data(equalPie(phase.daySummaries));

              allArcs
                .enter()
                .append('svg:g')
                .append('svg:path')
                .attr('d', startArc)
                .attr('class', scope.getDaySummaryClass)
                .transition()
                .duration(500)
                .ease('quad-in-out')
                .delay(500 * (index + 1))
                .attr('d', completeArc);
                

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

    bpnDirectives.directive('bpnDirectivesControlActionGraph', function() { 
      return {
        restrict : "EA",
        replace : true,
        scope : {
          controlAction : "=",
          eventHandler : '&customClick'
        },
        template : '<div class="control ring-graph {{controlAction.control.className}}" ng-click="eventHandler()"><img src="/assets/img/spinner.svg" class="spinner" ng-show="controlAction.updateInProgress" /><i class="icon-glyph-new {{controlAction.control.className}} {{iconMap[controlAction.control.className]}}" aria-hidden="true"></i></div>',
        controller : function ($scope, $element, $attrs, $transclude){
          $scope.getPathClassName = function (data, index) {
            var num = parseInt(data.data.value, 10);

            if (num == 0) {
              return 'off';
            } else {
              return 'on';
            }
          };

          $scope.iconMap = {
            'seedlingheatmat' : 'icon-__96_heatmat_00e36c',
            'humidifier' : 'icon-__98_humidifier_00e36c',
            'airconditioner' : 'icon-__92_ac_00e36c',
            'heater' : 'icon-__94_heater_00e36c',
            'fan' : 'icon-__83_fan_00e36c',
            'waterpump' : 'icon-__88_waterpump_00e36c',
            'light' : 'icon-__100_light_accessory_00e36c'
          }


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
          if (scope.controlAction.control) {
            className = 'control-' + scope.controlAction.control.className;
          } else {
            className = 'action';
          }

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
});