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
        .defer(d3.csv, "data/UnitedStatesFin.csv") //load attributes from csv
        .defer(d3.json, "data/UnitedStatesFinal.topojson") //initial spatial data w/ attributes in topojson
        .defer(d3.json, "data/UnitedStatesApril5.topojson") //backup spatialdata
        .await(callback);

    function callback(error, csvData, US, US45){
        console.log(csvData);
        console.log(US45);
        
        //translate europe TopoJSON
        var USfeatures= topojson.feature(US, US.objects.UnitedStates).features;
        console.log(USfeatures);
    
        var attrArray = ["var1", "var2", "var3", "var4", "var5", "var6","var7", "var8"];
        
        for (var i=0; i<csvData.length; i++){
            var csvState = csvData[i]; //the current state
            var csvKey = csvState.State; //the CSV primary key
            
            //loop through geojson regions to find correct region
            for (var a=0; a<USfeatures.length; a++){
                var geojsonProps = USfeatures[a].properties; //the current region geojson properties
                var geojsonKey = geojsonProps.State; //the geojson primary key
                
                  //where primary keys match, transfer csv data to geojson properties object
                if (geojsonKey == csvKey){
                     //assign all attributes and values
                    attrArray.forEach(function(attr){
                        console.log(typeof(attr));
                        var val = parseFloat(csvState[attr]); //get csv attribute value
                        geojsonProps[attr] = val; //assign attribute and value to geojson properties
                    });
            };
        };
    };

            
            //for each variable in the current state
                
        
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