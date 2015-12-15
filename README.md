# CS573FinalViz
Final Project for CS573: Data Visualization

- Link to our prototype: [Prototype](http://sbarman-mi9.github.io/CS573FinalViz/index.html)

colorScale = d3.scale.linear().domain(d3.extent(mapData, function(d){ return d.crashes; }))
                                 .range(["#ffe5e5", "#ff0000"]);
                                 
                                 mapData = d3.map(mapData, function(d) { return d.type; });