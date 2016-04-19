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
        var graticule = d3.geo.graticule()
            .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

        //create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines

    
        var states = map.selectAll(".states")
            .data(USfeatures) 
            .enter()
            .append("path")
            .attr("class", function(d){
                console.log(d);
                return "states " + d.properties.State;
            })
            .attr("d", path);
        
        
        
        /*
         var countries = map.append("path")
            .datum(europeCountries)
            .attr("class", "countries")
            .attr("d", path);

        //add France regions to map
        var regions = map.selectAll(".regions")
            .data(franceRegions)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "regions " + d.properties.adm1_code;
            })
            .attr("d", path);
        */
        
        
    };
};