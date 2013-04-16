require([
    'bpnApp',
    'angular-bootstrap',
    'd3',
    'view-models',
    'es5shim',
    'steps',
    'moment',
    'fe-be-utils',
    'overlay'
    ],
function(){
	'use strict';

	window.ghettoHackVar = undefined;

	bpn.pages.dashboard = {
    getPhaseFillColor : function(data, index){
        var num = data.data;

        if (num == 0) { 
            return '#46f121';
        } else if (num == 2){
            return '#24d321';
        } else if (num < 1){
            return '#D2E000';
        } else {
            return '#24d321';
        }
    },
    drawPhaseGraphs : function(){
        var phases = bpn.user.currentGrowPlanInstance.phases,
            phaseCount = phases.length,
            $container = $('#phases-graph'),
            outerMargin = 80,
            width = $container.width() - (outerMargin * 2),
            height = width,
            radius = width / 2,
            innerWhitespaceRadius = radius/(phaseCount + 1),
            // sum of all arcSpans must fit between outer boundary and inner whitespace
            arcSpan = (radius - innerWhitespaceRadius)/phaseCount,
            arcMargin = 0,
            colorScale = d3.scale.category20c(),
            equalPie = d3.layout.pie();


        // disable data sorting & force all slices to be the same size
        equalPie
        .sort(null)
        .value(function(d){
            return 1;
        });

        var svg = d3.select('#phases-graph')
            .append('svg:svg')
                .attr('width', width)
                .attr('height', height);

        //$('#phases-graph').append($('.barberPolePattern'));

        $.each(phases, function(index, phase){
            var arc = d3.svg.arc(),
                className = 'phase' + index,
                phaseGroup;

            ghettoHackVar = className;

            var phaseDaySummaries = [];
            for (var i = 0; i < phase.phase.expectedNumberOfDays; i++){
                var colorVal = (index + (index == 1 ? (Math.random() - .4) : 0));
                phaseDaySummaries.push(colorVal);
            }

            arc.outerRadius(radius - (arcSpan * index) - arcMargin)
                .innerRadius(radius - (arcSpan * (index+1)) - arcMargin);

            phaseGroup = svg.append('svg:g')
                .classed(className, true)
                .attr('transform', 'translate(' + (width / 2) + ',' + (width / 2) + ')');

            /*var maskSel = phaseGroup.selectAll('defs')
                .data(equalPie(phaseDaySummaries))
                .enter();
                
                maskSel.append('svg:mask')
                    .append('svg:path')
                    .attr('d', arc)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 1)
                    //.attr('fill', bpn.pages.dashboard.getPhaseFillColor);
                    //.attr('style', 'background: #ff00ff')
                    .attr('fill', 'black')
                    .attr('id', function(d,i){
                        return 'phase'+i;}+phase._id)*/

           /* var sel = phaseGroup.selectAll('path')
                .data(equalPie(phaseDaySummaries))
                //.attr('class',)
                .enter()
                    .append('svg:path')
                    .attr('d', arc)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 1)
                    .attr('fill', bpn.pages.dashboard.getPhaseFillColor)
                    .append("svg:text")
                        .attr("transform", function(d) { 
                            return "translate(" + arc.centroid(d) + ")"; 
                        })
                        .attr("dy", ".35em")
                        .attr("text-anchor", "middle")
                        .text(function(d, i) { return "TEST " + i });*/

            var allArcs = phaseGroup.selectAll('path')
                .data(equalPie(phaseDaySummaries));

            allArcs
                .enter()
                    .append('svg:g')
                        .attr('id', function(d, i) {
                            return ghettoHackVar+'-arc'+i;
                        } )
                        .append('svg:path')
                            .attr('d', arc)
                            .attr('stroke', '#fff')
                            .attr('stroke-width', 1)
                            .attr('fill', bpn.pages.dashboard.getPhaseFillColor);
            allArcs
                .on('click', function(d, i) {
                    var barberPoleCont = $('.barberPoleCont');
                    var barberPolePattern = $('.barberPolePattern');
                    var angle = d.startAngle + ((d.endAngle - d.startAngle)/2);
                    var centroidX = arc.centroid(d)[0] + width/2;
                    var centroidY = arc.centroid(d)[1] + width/2;

                    barberPolePattern.attr('transform', 'rotate(' + (Math.degrees(angle) + 45) + ')');

                    //barberPole.attr('transform', 'translate(' + centroidX + ',' + centroidY + ') rotate(' + (Math.degrees(angle) + 45) + ')');
                    barberPoleCont.css('mask', 'url(#mask-'+$(this).attr('id')+')');
                    barberPoleCont.attr('transform', 'translate(' + (width / 2) + ',' + (width / 2) + ')');


                    console.log("WIDTH " + width);

                    //barberPole.attr('transform', 'translate(' + arc.centroid(d) + ') rotate(' + (Math.degrees(angle) + 45) + ')');

                    
                });

            var maskGroup = svg.append('defs').append('g')
                .attr('transform', 'translate(' + (width / 2) + ',' + (width / 2) + ')');

            var allMasks = maskGroup.selectAll('mask')
                .data(equalPie(phaseDaySummaries))
            
            allMasks
                .enter()
                    .append('svg:mask')
                        .attr('id', function(d, i) {
                            return 'mask-'+ghettoHackVar+'-arc'+i;
                        } )
                        .append('svg:path')
                            .attr('d', arc)
                            .attr('stroke', '#fff')
                            .attr('stroke-width', 1)
                            .attr('fill', bpn.pages.dashboard.getPhaseFillColor);
        });
        

        /*var arcGen = d3.svg.arc(),
            curTime = new Date(Date.now()),
            timeIntoDay = (curTime.getHours() * 3600000) +  (curTime.getMinutes() * 60000) + (curTime.getSeconds() * 1000)+ curTime.getMilliseconds(),
            millisInDay = 86400000,
            timerLocRad = (Math.PI * 2) * (timeIntoDay / millisInDay),
            timerLocDeg = 360 * (timeIntoDay / millisInDay);

        console.log("TIMER LOC RAD " + timerLocDeg);*/
    },
    getControlFillColor : function(data, index){
        var num = parseInt(data.data.value, 10);
        
        if (num == 0) { 
            return '#46f121'
        } else {
            return '#24d321';
        }
    },
    drawControlGraphs : function(){
        var controls = bpn.user.currentGrowPlanInstance.controls,
            $container = $('#controls'),
            outerMargin = 0,
            width = $container.find('.control').width() - (outerMargin * 2),
            height = width,
            radius = width / 2,
            innerWhitespaceRadius = radius/2,
            // sum of all arcSpans must fit between outer boundary and inner whitespace
            arcSpan = (radius - innerWhitespaceRadius),
            arcMargin = 0,
            colorScale = d3.scale.category20c(),
            pie = d3.layout.pie(),
            dayMilliseconds = 24 * 60 * 60 * 1000;

        // disable data sorting & force all slices to be the same size
        pie
        .sort(null)
        .value(function(d){
            return d.timespan;
        });

        $.each(controls, function(controlKey, control){
            var svg = d3.select('#controls .control.' + control.className)
                        .append('svg:svg')
                            .attr('width', width)
                            .attr('height', height);

            var arc = d3.svg.arc(),
                className = 'control-' + control.className,
                svgGroup;

            var cycleStringParts = control.action.cycleString.split(',');
            var cycleStates = [];
            cycleStates[0] = {
                value : parseInt(cycleStringParts[0], 10),
                timespan : parseInt(cycleStringParts[1], 10)
            };
            cycleStates[1] = {
                value : parseInt(cycleStringParts[2], 10),
                timespan : parseInt(cycleStringParts[3], 10)  
            };
            var overallCycleTimespan = cycleStates[0].timespan + cycleStates[1].timespan;
            var numDayCycles = dayMilliseconds/overallCycleTimespan;
            var cycleGraphData = [];
            for (var i = 0; i < numDayCycles; i++){
                cycleGraphData.push(cycleStates[0]);
                cycleGraphData.push(cycleStates[1]);
            }


            arc.outerRadius(radius  - arcMargin)
                .innerRadius(radius - arcSpan - arcMargin);

            svgGroup = svg.append('svg:g')
                .classed(className, true)
                .attr('transform', 'translate(' + (width / 2) + ',' + (width / 2) + ')');

            svgGroup.selectAll('path')
            .data(pie(cycleGraphData))
            .enter()
                .append('svg:path')
                    .attr('d', arc)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 1)
                    .attr('fill', bpn.pages.dashboard.getControlFillColor)
                    /*.append("svg:text")
                        .attr("transform", function(d) { 
                            return "translate(" + arc.centroid(d) + ")"; 
                        })
                        .attr("dy", ".35em")
                        .attr("text-anchor", "middle")
                        .text(function(d, i) { return "TEST " + i });*/

        });
    },
    initEventHandlers : function(){
        $('#controls').on('click', '.control', function(e){
            e.preventDefault();

            var $this = $(this),
                tooltipContent = $this.data('tooltipContent'),
                controlKey = $this.data('controlKey'),
                controlData = bpn.user.currentGrowPlanInstance.controls[controlKey];
            
            if (!tooltipContent){
                // Get the immediately-triggerable actions for this control
                $.getJSON('/api/actions', 
                    {control : controlData.id, repeat : false },
                    function(data){
                        var model = {
                            name : controlKey,
                            actions : data
                        },
                        template = $('#templates #control-tooltip-template').val(),
                        $content = $(Mustache.render(template, model));

                        $content.on('click', '.action-trigger-link', function(e){
                            var $this = $(this),
                                actionId = $this.data('actionId');
                                $this.append('<div class="loader"></div>');
                                
                                $.ajax({
                                    type: 'POST',
                                    url: '/api/grow-plan-instances/' + bpn.user.currentGrowPlanInstance.id + '/action_override_logs',
                                    data: { actionId: actionId },
                                    success: function(data){
                                        $this.find('.loader').remove();
                                        alert('triggered ');
                                    },
                                    error: function(jqXHR, textStatus, error){
                                        console.log('error', jqXHR, textStatus, error);
                                        // TODO retry a certain number of times
                                    }
                                });
                                
                        });

                        $this.data('tooltipContent', $content);
                        
                        $this.qtip({
                            content: {
                                text: $content
                            },
                            show: {
                                event: 'click'
                            },
                            hide : {
                                event : 'click'
                            },
                            position: {
                                viewport: $(window)
                            }
                        })
                        .qtip('toggle', true); 
                    }
                );    
            }
            
        });
    },
    drawSparkGraph : function (svgCont, setData, idealLow, idealHigh, belowResolution) {
        var width = 400;
        var height = 100;

        var yExtent = d3.extent(setData, function(d) { return d.value; });

        var xScale = d3.scale.linear()
            .domain(d3.extent(setData, function(d) { 
                return d.time; }))
            xScale.range([0, width]);
            //.nice();      

        var yScale = d3.scale.linear()
            .domain(d3.extent(setData, function(d) { return d.value; }))
            .range([height, 0]);

        var yColorScale = d3.scale.linear()
            .domain([yExtent[0], idealLow, idealLow, idealHigh, idealHigh, yExtent[1]])
            .range(['red', 'red', 'green', 'green', 'red', 'red']);

        var line = d3.svg.line()
            .x(function(d) { 
                return xScale(d.time); })
            .y(function(d) { 
                return yScale(d.value); });

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
            .domain([yExtent[0], idealLow-belowResolution, idealLow, idealHigh, idealHigh+belowResolution, yExtent[1]])
            .range(['low', 'low', 'normal', 'normal', 'high', 'high']);

        for(var i=0; i<setData.length; i++) {
            if(curArr.length == 0) {
                curArr.push(setData[i]);
            } else {
                if(testScale(setData[i-1].value) != testScale(setData[i].value)) {
                    if( (testScale(setData[i-1].value) == 'low' || testScale(setData[i-1].value) == 'normal') && (testScale(setData[i].value) == 'low' || testScale(setData[i].value) == 'normal') ){
                        crossPercent = Math.abs(idealLow - setData[i-1].value) / Math.abs (setData[i].value - setData[i-1].value)
                        crossTime = ((setData[i].time - setData[i-1].time) * crossPercent ) + setData[i-1].time;

                        crossPoint = {'time': crossTime, 'value': idealLow-belowResolution};
                    } else if( (testScale(setData[i-1].value) == 'high' || testScale(setData[i-1].value) == 'normal') && (testScale(setData[i].value) == 'high' || testScale(setData[i].value) == 'normal') ){
                        crossPercent = Math.abs(idealHigh - setData[i-1].value) / Math.abs(setData[i].value - setData[i-1].value)
                        crossTime = ((setData[i].time - setData[i-1].time) * crossPercent ) + setData[i-1].time;

                        crossPoint = {'time': crossTime, 'value': idealHigh+belowResolution};
                    } else {
                        console.log("NOT SUPPOSED TO!! i-1 " + testScale(setData[i-1].value) + " i " + testScale(setData[i-1].value) );
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
                    .attr('stroke', function(d,i){
                        return yColorScale(d[1].value);})
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
    },
    makeDayProgressClock : function (svg, radius, triangleSize) {
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
                    .attr("points", width/2+","+radius+" "+((width/2)+(triangleSize/2))+","+(triHeight+radius)+" "+((width/2)-(triangleSize/2))+","+(triHeight+radius));

        if(!GlobalThumbTimer) {
            //GlobalThumbTimer = setInterval(globalThumbFunc, 60000);
            GlobalThumbTimer = setInterval(globalThumbFunc, 1000);
        }
    },
    drawBarSet : function (target, barWidth, barLength, barSpacing, numBars){
        var svg,
            startLoc = 0,
            totalHeight = ((barWidth*numBars)+(barSpacing*(numBars-1))),
            //startLoc = ((barWidth*numBars) + (barSpacing*numBars))/-2,
            bar,
            barGroup;

        svg = d3.select(target).append('svg:g').attr('class', 'barberPoleCont');

        barGroup = svg
            .attr('width', barLength)
            .attr('height', ((barWidth*numBars)+(barSpacing*(numBars-1))))
                .append('svg:g')
                .attr('class', 'barberPolePattern');

        for (var i = 0; i<numBars; i++) {
            barGroup
                .append("svg:rect")
                    .attr('x', (barLength / -2))
                    .attr('y', ((startLoc + (barWidth*i) + (barSpacing*i)) + (totalHeight / -2)  ) )
                    .attr('width', barLength)
                    .attr('height', barWidth);
        }
	    }
	};


	var dataSet = [];
	var GlobalThumbTimer;

	var globalThumbFunc = function () {
	    /*var curTime = new Date(Date.now()),
	        timeIntoDay = (curTime.getHours() * 3600000) +  (curTime.getMinutes() * 60000) + (curTime.getSeconds() * 1000)+ curTime.getMilliseconds(),
	        millisInDay = 86400000,
	        timerLocRad = (Math.PI * 2) * (timeIntoDay / millisInDay),
	        timerLocDeg = 360 * (timeIntoDay / millisInDay);

	    $(".timeProgressThumb").each(function(index, ele){
	        ele.attr("tranform", "rotate("+timeLoc/deg+" "+ele.width+" "+ele.height+")");
	    })*/

	    var curTime = new Date(Date.now()),
	        timeIntoDay = (curTime.getSeconds() * 1000) + curTime.getMilliseconds(),
	        millisInDay = 60000,
	        timerLocRad = (Math.PI * 2) * (timeIntoDay / millisInDay),
	        timerLocDeg = 360 * (timeIntoDay / millisInDay);

	    var allClocks = $(".timeProgressThumb");
	    var curClock;

	    for (var i = 0; i<allClocks.length; i++) {
	        curClock = $(allClocks[i]);
	        curClock.attr("transform", "rotate("+timerLocDeg+" "+(curClock.attr('width')/2)+" "+(curClock.attr('height')/2)+")");
	    }
	}

	//dataSet.push({'time': 300000, 'value': 16});
	//dataSet.push({'time': 600000, 'value': 36});
	//dataSet.push({'time': 900000, 'value': 36});

	/*dataSet.push({'time': 300000, 'value': 20});
	dataSet.push({'time': 600000, 'value': 30});
	dataSet.push({'time': 900000, 'value': 40});
	dataSet.push({'time': 1200000, 'value': 45});
	dataSet.push({'time': 1500000, 'value': 50});

	dataSet.push({'time': 1800000, 'value': 60});
	dataSet.push({'time': 2100000, 'value': 60});
	dataSet.push({'time': 2400000, 'value': 60});
	dataSet.push({'time': 2700000, 'value': 50});
	dataSet.push({'time': 3000000, 'value': 40});*/

	for(var i=0; i<100; i++){
	    dataSet[i] = {
	        'time': (300000 * i),
	        'value': Math.round(( Math.round((Math.random() * 50) + 20) + ((i != 0) ? dataSet[i-1].value : 0))/2)
	    };
	}

	Math.radians = function(degrees) {
	  return degrees * Math.PI / 180;
	};
	 
	Math.degrees = function(radians) {
	  return radians * 180 / Math.PI;
	};


	$(function () {
	    bpn.pages.dashboard.drawPhaseGraphs();
	    bpn.pages.dashboard.drawControlGraphs();
	    bpn.pages.dashboard.initEventHandlers();
	    bpn.pages.dashboard.drawSparkGraph($('#footer').get(0), dataSet, 35, 55, 0.1);
	    bpn.pages.dashboard.makeDayProgressClock($('#phases-graph svg').get(0), 200, 10);
	    bpn.pages.dashboard.drawBarSet($('#phases-graph svg').get(0), 20, 2000, 15, 30);
	});

});
