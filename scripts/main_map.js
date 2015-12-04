console.log(d3.version);
        
var data = noOfRows = null, width = 615, height = 375;
var colorScale = null;

d3.csv("data/crash_ma.csv", function(d) {
    return {town: d.Town_Name, month: d.Month, season: d.Season, time_int: +d.Time_int,
           time_bin: d.Time_Bin, injuries: +d.Injuries};
}, function(error, rows){
    if (error) { alert("Error while loading dataset"); return; }
    data = rows;
    noOfRows = data.length
    console.log(noOfRows);

    var mapData = _.chain(data).groupBy("town").map(function(values, key) {
        return {type : key, 
               crashes: values.length}; //_.pluck(values, 'time_bin')
    }).value();

    colorScale = d3.scale.linear().domain(d3.extent(mapData, function(d){ return d.crashes; }))
                         .range(["#ffe5e5", "#ff0000"]);

    mapData = d3.map(mapData, function(d) { return d.type; });
    plotMap(mapData);
});

var plotMap = function(mapData, towns) {
    towns = d3.set(mapData.keys());
    d3.json("data/ma-towns.topojson", function(err, topology) {
        var geojson = topojson.feature(topology, topology.objects.towns);
        var path = d3.geo.path().projection(null);
        var svg = d3.select("#map svg");
        var g = svg.append("g").classed("g-town", true);
        g.selectAll("path.town").data(geojson.features)
            .enter().append("path")
            .classed("town", true)
            .attr("d", path)
            .style("fill", function(d, i) {
                  if (towns.has(d.properties.town)) {
                      return colorScale(mapData.get(d.properties.town).crashes);
                  }
                  return "none";
              })
            .style("stroke", "black")
            .on("mouseover", function(d) {
                if (towns.has(d.properties.town)) {
                    var x = d3.event.pageX;
                    var y = d3.event.pageY;
                    d3.select("#tooltip")
                        .style("left", x + "px")
                        .style("top", y + "px")
                        .style("opacity", 1)
                        .style("width", "100px")
                        .style("height", "20px")
                        .text(d.properties.town);
                }
            }).on("mouseout", function() { d3.select("#tooltip").style("opacity", 0); });
    });
};