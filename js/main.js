//begin script when window loads
window.onload = setMap();

function setMap(){    
     var width = 960,
        height = 460;

    //svg map container created
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //USA Albers projection
    var projection = d3.geo.albersUsa()
        .scale(1000)
        .translate([width / 2, height / 2]);
    
    //path is the projection
    var path = d3.geo.path()
        .projection(projection);
    
    //use queue.js to parallelize asynchronous data loading
    //note- I will be using UnitedStates.topojson , and the April5 version is a backup, but otherwise not used. 
    d3_queue.queue()
        .defer(d3.csv, "data/UnitedStates.csv") //load attributes from csv
        .defer(d3.json, "data/UnitedStates.topojson") //initial spatial data w/ attributes in topojson
        .defer(d3.json, "data/UnitedStatesApril5.topojson") //backup spatialdata
        .await(callback);

    function callback(error, csvData, US, US45){

        //translate europe TopoJSON
        var USfeatures= topojson.feature(US, US.objects.UnitedStates).features;
        console.log(USfeatures);
    
        //creates class names for each state indiividually(located at USfeatures.properties.State) and draws them to the map svg
        var states = map.selectAll(".states") 
            .data(USfeatures) 
            .enter()
            .append("path")
            .attr("class", function(d){
                console.log(d);
                return "states " + d.properties.State;
            })
            .attr("d", path); //"d" is the class name created for each state from the statement d.properties.State and added in to the "states" class. Now each there are 51 states attributes, each continang there own class titled by their state initials.
    };
};