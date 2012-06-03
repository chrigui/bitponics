/**
 * Static graphs
 */
$('#data-panels .data-graph').each(function(){
    var data = [ { x: 0, y: 40 }, { x: 1, y: 49 }, { x: 2, y: 17 }, { x: 3, y: 42 } ],
        graph = new Rickshaw.Graph( {
            element: $(this).get(0),
            //width: 200, //defaults to width of container
            height: 50,
            series: [ {
                    color: '#333',
                    data: data
            } ]
        } );

    graph.render();
})



/**
 * Live graph
 * Override the Air graph w/ a live graph based on incoming (faked) data.
 * Note the FixedDuration series.
 */
$('#data-panels .air .data-graph').empty(); //clear out the static graph create above
var tv = 500, //milliseconds
    i = 0,
    iv,
    air_graph = new Rickshaw.Graph( {
        element: document.querySelector("#data-panels .air .data-graph"),
        height: 50,
        series: new Rickshaw.Series.FixedDuration([{ name: 'one', color: '#333' }], undefined, {
            timeInterval: tv,
            maxDataPoints: 100,
            timeBase: new Date().getTime() / 1000
        })
    } );

// simulating live data updating
iv = setInterval( function() {

    var data = { one: Math.floor(Math.random() * 40) + 120 };

    var randInt = Math.floor(Math.random()*100);
    
    //to see what its like with multiple data series, uncomment
    //data.two = (Math.sin(i++ / 40) + 4) * (randInt + 400);
    //data.three = randInt + 300;

    air_graph.series.addData(data);
    air_graph.render();

}, tv );

$(function () {
    var lightGraph = $('#light-sensor-graph');
        
    Bitponics.socket = io.connect(Bitponics.appUrl);
});