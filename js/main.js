(function(){

    //array of attributes
    var attrArray = ["LNG", "HY", "ELEC", "E85", "CNG", "BD", "LPG", "total"];
    
    //initial attribute
    var expressed = attrArray[3]; 
    
//begin script when window loads
window.onload = setMap();

function setMap(){    
       //map frame dimensions
    var width = window.innerWidth * 0.5,
        height = 400;
    //svg map container created
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //USA Albers projection
    var projection = d3.geo.albersUsa()
        .scale(860)
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
        
        //add info box
        setInfo();
        
        //add coordinated visualization to the map
        setChart(csvData, colorScale);
        
        createDropdown();
        
    };
    }; 
    
         //function to create a dropdown menu for attribute selection
function createDropdown(){
    //add select element
    var dropdown = d3.select("body")
        .append("select")
        .attr("class", "dropdown");

    //add initial option
    var titleOption = dropdown.append("option")
        .attr("class", "titleOption")
        .attr("disabled", "true")
        .text("Select Attribute");

    //add attribute name options
    var attrOptions = dropdown.selectAll("attrOptions")
        .data(attrArray)
        .enter()
        .append("option")
        .attr("value", function(d){ return d })
        .text(function(d){ return d });
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
            return choropleth(d.properties, colorScale);
        });

    };
    //function to test for data value and return color
function choropleth(props, colorScale){
    //make sure attribute value is a number
    var val = parseFloat(props[expressed]);
    //if attribute value exists, assign a color; otherwise assign gray
    if (val && val != NaN){
        return colorScale(val);
    } else {
        return "#CCC";
    };
};
    function setInfo(){
         var infoWidth = window.innerWidth* 0.4,
        infoHeight = 400;
        var infoBox = d3.select("body")
        .append("svg")
        .attr("width", infoWidth)
        .attr("height", infoHeight)
        .attr("class", "infoBox");
        
    }
    //function to create coordinated bar chart
    function setChart(csvData, colorScale){
        //chart frame dimensions
         var chartWidth = window.innerWidth*0.9,
        chartHeight = 150;

            //Example 2.1 line 17...create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");
    var yScale = d3.scale.linear()
        .range([0, chartHeight])
        .domain([0, 80]);
        
        

    var bars = chart.selectAll(".bars")
        .data(csvData)
        .enter()
        .append("rect")
          .sort(function(a, b){
            return a[expressed]-b[expressed]
        })
      
        .attr("class", function(d){
            return "bars " + d.State;
        })
        .attr("width", chartWidth / csvData.length - 1)
        .attr("x", function(d, i){
            return i * (chartWidth / csvData.length);
        })
        .attr("height", function(d){
            return yScale(parseFloat(d[expressed])*7); //5 added for visual aid
        })
        .attr("y", function(d){
            return chartHeight - (yScale(parseFloat(d[expressed]))*7); //mulitipled by 5 for visual aid
        })
        .style("fill", function(d){
            return choropleth(d, colorScale);
        });
        
        //if 0, don't show
        //if NaN, say none (verticle)
        //TODO- ONLY Show if cursor is placed over it! //otherwise remove
    var numbers = chart.selectAll(".numbers")
        .data(csvData)
        .enter()
        .append("text")
        .sort(function(a, b){
            return a[expressed]-b[expressed]
        })
        .attr("class", function(d){
            return "numbers " + d.State;
        })
        .attr("text-anchor", "middle")
        .attr("x", function(d, i){
            var fraction = chartWidth / csvData.length;
            return i * fraction + (fraction - 1) / 2;
        })
        .attr("y", function(d){
            return chartHeight - (yScale(parseFloat(d[expressed]))*7); //shifted numbers to bottom of bar charts
        })
        .text(function(d){
            return d3.round(d[expressed]-5)+5; //move state underneith eventually (make a new var, and from there do +25 to put it above the graph)
        });
        
    var stateInt = chart.selectAll(".stateInt")
        .data(csvData)
        .enter()
        .append("text")
        .sort(function(a, b){
            return a[expressed]-b[expressed]
        })
        .attr("class", function(d){
            return "numbers " + d.State;
        })
        .attr("text-anchor", "middle")
        .attr("x", function(d, i){
            var fraction = chartWidth / csvData.length;
            return i * fraction + (fraction - 1) / 2;
        })
        .attr("y", function(d){
            return chartHeight; //shifted numbers to bottom of bar charts
        })
        .text(function(d){
            return d.State; //move state underneith eventually (make a new var, and from there do +25 to put it above the graph)
        });
        
          //below Example 2.8...create a text element for the chart title
    var chartTitle = chart.append("text")
        .attr("x", 20)
        .attr("y", 20)
        .attr("class", "chartTitle")
        .text("Number of Stations offering Fuel Alternative: " + expressed + " for every 100,000 persons in each State");
    };
    
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

    //place axis
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);

    //create frame for chart border
    var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);
})();