Bitponics.pages.dashboard = {
    getPhaseFillColor : function(data, index){
        var num = data.data;

        if (num == 0) { 
            return '#46f121'
        } else if (num == 2){
            return '#24d321';
        } else if (num < 1){
            return '#D2E000';
        } else {
            return '#24d321';
        }
    },
    drawPhaseGraphs : function(){
        var phases = Bitponics.user.currentGrowPlanInstance.phases,
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

        $.each(phases, function(index, phase){
            var arc = d3.svg.arc(),
                className = 'phase' + index,
                phaseGroup;

            var phaseDaySummaries = [];
            for (var i = 0; i < phase.phase.expectedNumberOfDays; i++){
                var colorVal = (index + (index == 1 ? (Math.random() - .4) : 0));
                //console.log('colorval ' + colorVal);
                phaseDaySummaries.push(colorVal);
            }

            arc.outerRadius(radius - (arcSpan * index) - arcMargin)
                .innerRadius(radius - (arcSpan * (index+1)) - arcMargin);

            phaseGroup = svg.append('svg:g')
                .classed(className, true)
                .attr('transform', 'translate(' + (width / 2) + ',' + (width / 2) + ')');

            phaseGroup.selectAll('path')
            .data(equalPie(phaseDaySummaries))
            .enter()
                .append('svg:path')
                .attr('d', arc)
                .attr('stroke', '#fff')
                .attr('stroke-width', 1)
                .attr('fill', Bitponics.pages.dashboard.getPhaseFillColor);
        });
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
        var controls = Bitponics.user.currentGrowPlanInstance.controls,
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
                .attr('fill', Bitponics.pages.dashboard.getControlFillColor);
        });
    },
    initEventHandlers : function(){
        $('#controls').on('click', '.control', function(e){
            e.preventDefault();

            var $this = $(this),
                tooltipContent = $this.data('tooltipContent'),
                controlKey = $this.data('controlKey'),
                controlData = Bitponics.user.currentGrowPlanInstance.controls[controlKey];
            
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
                                    url: '/api/grow_plan_instances/' + Bitponics.user.currentGrowPlanInstance.id + '/action_override_logs',
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
    }
};

$(function () {
    Bitponics.pages.dashboard.drawPhaseGraphs();
    Bitponics.pages.dashboard.drawControlGraphs();
    Bitponics.pages.dashboard.initEventHandlers();
});



/*

var sampleData = {
    phases : [
        {
            name : 'Vegetative',
            numberExpectedDays : 30,
            dayData : [ // will be randomly populated by code

            ]
        },
        {
            name : 'Flowering',
            numberExpectedDays : 40,
            dayData : [ // will be randomly populated by code

            ]
        }
    ]
};

$(function () {
    var i = 0,
        phase1 = sampleData.phases[0],
        phase2 = sampleData.phases[1];

    for (i = 0; i < (phase1.numberExpectedDays); i++){
        if ( i < (phase1.numberExpectedDays / 2 ) ){
            phase1.dayData.push(i);
        } else {
            phase1.dayData.push(-1);
        }
    }

    for (i = 0; i < (phase2.numberExpectedDays); i++){
        phase2.dayData.push(-1);
    }
    
    var width,
        height = width = 600,
        radius = width / 2,
        colorScale = d3.scale.category20c(),
        equalPie = d3.layout.pie(),
        arcSpan = 100,
        arcMargin = 0,
        innerArc = d3.svg.arc(),
        outerArc = d3.svg.arc();
    
    // disable data sorting & force all slices to be the same size
    equalPie.sort(null)
        .value(function(d){
            return 1;
        });


    outerArc.outerRadius(radius)
            .innerRadius(radius - arcSpan);
    
    innerArc.outerRadius(radius - arcSpan - arcMargin)
            .innerRadius(radius - (arcSpan * 2) - arcMargin);


    var svg = d3.select('#phases-graph')
                    .append('svg:svg')
                        .attr('width', width)
                        .attr('height', height);

    
    var phase1G = svg.append('svg:g')
                    .classed('phase1', true)
                    .attr('transform', 'translate(' + (width / 2) + ',' + (width / 2) + ')');

    var phase2G = svg.append('svg:g')
                    .classed('phase2', true)
                    .attr('transform', 'translate(' + (width / 2) + ',' + (width / 2) + ')');
    
    var getFillColor = function(data, index){
        var num = parseInt(data.data);

        if (num < 0 ) { 
            return '#aaa';
        } else if (num < 10){
            return '#ccc'
        } else {
            return '#eee'
        }
    }

    phase1G.selectAll('path')
        .data(equalPie(phase1.dayData))
        .enter()
            .append('svg:path')
            .attr('d', innerArc)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .attr('fill', getFillColor);
    
    phase2G.selectAll('path')
        .data(equalPie(phase2.dayData))
        .enter()
            .append('svg:path')
            .attr('d', outerArc)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .attr('fill', '#aaa');

    var phase1GRotate = 0;
    setInterval(function(){
        phase1G.attr('transform', 'translate(' + (width / 2) + ',' + (width / 2) + ') rotate(' + phase1GRotate + ')');
        phase1GRotate += .5;
        if (phase1GRotate == 360){ phase1GRotate = 0; }
    }, 30)
});
*/