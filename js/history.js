/*temporary js document*/
window.onload = function(){
    var container = d3.select("body") //get's the <body> element from the DOM
        .append("svg")
};

//isn't working...
 var circles = container.selectAll(".circles") //create an empty selection
        .data(cityPop) //here we feed in an array
        .enter() //one of the great mysteries of the universe
        .append("circle") //inspect the HTML--holy crap, there's some circles there
        .attr("class", "circles")
        .attr("id", function(d){
            return d.city;
        })
        .attr("r", function(d){
            //calculate the radius based on population value as circle area
            var area = d.population * 0.01;
            return Math.sqrt(area/Math.PI);
        })
        .attr("cx", function(d, i){
            //use the index to place each circle horizontally
            return 90 + (i * 180);
        })
        .attr("cy", function(d){
            //subtract value from 450 to "grow" circles up from the bottom instead of down from the top of the SVG
            return 450 - (d.population * 0.0005);
        });






//was supposed to be naming underneath. not sure how to .stringify
    var cities = innerRect.selectAll(".cities") //this doing anything? //A: No
        .data(cityPop)
        .enter()
        .append("cities")
        .attr("class","cities")
        .attr("id", function(d){
            return d.city.stringify;
        });





 var y = d3.scale.linear()
        .range([440, 95])
        .domain([
            minPop,
            maxPop
        ]);
    
    