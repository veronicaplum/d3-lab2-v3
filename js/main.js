//begin script when window loads
window.onload = setMap();

function setMap(){    
     var width = 960,
        height = 460;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);
/*
    var projection = d3.geo.albers()
        .center([0, 46.33])
        .rotate([106.45, -0.91, 0])
        .parallels([40.18, 54.69])
        .scale(503.03)
        .translate([(width / 2, height) / 2]);
    */
    
    
    var projection = d3.geo.albersUsa()
        .scale(1000)
        .translate([width / 2, height / 2]);
    
    var path = d3.geo.path()
        .projection(projection);
    
    //use queue.js to parallelize asynchronous data loading
    d3_queue.queue()
        .defer(d3.csv, "data/UnitedStates.csv") //load attributes from csv
        .defer(d3.json, "data/UnitedStates.topojson") //load background spatial data
        .defer(d3.json, "data/UnitedStatesApril5.topojson") //load choropleth spatial data
        .await(callback);

    function callback(error, csvData, US, US45){

        console.log(US);
 
        
        //translate europe TopoJSON
        var USfeatures= topojson.feature(US, US.objects.UnitedStates).features;
       
        console.log(USfeatures);
    
        var states = map.selectAll(".states")
            .data(USfeatures) 
            .enter()
            .append("path")
            .attr("class", function(d){
                console.log(d);
                return "states " + d.properties.State;
            })
            .attr("d", path);
        
        
        
    };
};