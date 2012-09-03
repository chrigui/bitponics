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
        height = width = 400,
        radius = width / 2,
        colorScale = d3.scale.category20c(),
        equalPie = d3.layout.pie(),
        arcSpan = 60,
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