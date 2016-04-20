(function(){

    //array of attributes
    var attrArray = ["LNG", "HY", "ELEC", "E85", "CNG", "BD", "LPG", "total"];
    
    //initial attribute
    var expressed = attrArray[2]; 
    
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
        .await(callback);

    function callback(error, csvData, US){
        console.log(csvData);
        
        //translate europe TopoJSON
        var USfeatures= topojson.feature(US, US.objects.UnitedStates).features;
        console.log(USfeatures);

        //join csv data to GeoJSON enumeration units
        USfeatures = joinData(USfeatures, csvData);
        
        //color scale
        colorScale = makeColorScale(csvData); //can't have var infront of it! It is not a vairable!
        
        //add enumeration units to the map
        setEnumerationUnits(USfeatures, map, path, colorScale);
    };
    };  
    //creates color scale based on breaks
    function makeColorScale(data){
        var colorClasses = [
            "#ffffcc",
            "#c3e699",
            "#78c679",
            "#31a354",
            "#006837"
        ];
   //create color scale generator
    var colorScale = d3.scale.quantile()
        .range(colorClasses);

    //build array of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    };

    //assign array of expressed values as scale domain
    colorScale.domain(domainArray);

    return colorScale;
    };
 

    //joins spatial data with csv
    function joinData(USfeatures, csvData){
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
        return USfeatures;
    };
    
    //draws polygons with with csv data combined
    function setEnumerationUnits(USfeatures, map, path, colorScale){
        var states = map.selectAll(".states") 
            .data(USfeatures) 
            .enter()
            .append("path")
            .attr("class", function(d){
                console.log(d);
                return "states " + d.properties.State;
            })
            .attr("d", path)
            .style("fill", function(d){
            return colorScale(d.properties[expressed]);
        });

    };
    
    //function to create coordinated bar chart
    function setChart(csvData, colorScale){
        //chart frame dimensions
        var chartWidth = 550,
            chartHeight = 460;

        //create a second svg element to hold the bar chart
        var chart = d3.select("body")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
             .attr("class", "chart");
    };
})();