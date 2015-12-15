console.log(d3.version);
$.fn.extend({
    propAttr: $.fn.prop || $.fn.attr
});
$("#radio").buttonset();

var margin = {top: 20, right: 50, bottom: 60, left: 80};
var width = document.body.clientWidth - margin.left - margin.right;
width=width-100
var height = 420;
var color  = d3.scale.category20(); 
var gap = 5;

var svg=$("#towns svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

var data = noOfRows = null;

d3.csv("data/crash_ma.csv", function(d) {
    return {town: d.Town_Name, month: d.Month, season: d.Season, time_int: +d.Time_int,
           time_bin: d.Time_Bin, injuries: +d.Injuries, road_cond: d.Road_Surface_Condition,
           light_cond: d.Ambient_Light};
}, function(error, rows){
    if (error) { alert("Error while loading dataset"); throw error; }
    data = rows;
    noOfRows = data.length;
    console.log(noOfRows);
    prepareDataForAll(data);

    var towns = d3.set();
    data.forEach(function(d, i) { towns.add(d.town); });
    d3.select("#t_cond").selectAll("option")
        .data(towns.values())
        .enter().append("option")
        .attr("value", function(d, i) { return d; })
        .attr("selected", function(d, i) { if (d == "WORCESTER") return "selected"; } )
        .text(function(d, i) {return d;});

    prepareConditionData("WORCESTER");

    $("#time_slider").slider({
        range: true, min: 0, max: 2400, values: [0, 2400], step: 100,
        slide: function(evnt, ui) {
            var upper = ui.values[1]/100 + ":00";
            if (ui.values[1]/100 == 24) {
                upper = "23:59";
            }
            d3.select("#time_range").text("Time(24-HR): " + ui.values[0]/100 + ":00 - " + upper);
            d3.selectAll("#towns svg g").remove();
            prepareDataForAll(
                _.filter(data, function(d) { 
                    if (d.time_int >= ui.values[0] && d.time_int < ui.values[1])
                        return true;
                    return false;
                })
            );
        }
    });
});

d3.selectAll("#radio input").on("click", function() {
    if (this.value == "All") {
        d3.select("#seasons_radio").classed("show", false);
        d3.select("#time").classed("show", false);
        d3.selectAll("#towns svg g").remove();
        prepareDataForAll(data);
    }
    if (this.value == "Seasons") {
        d3.select("#time").classed("show", false);
        d3.select("#seasons_radio").classed("show", true);

        d3.selectAll("#seasons_radio input").on("click", function() {
            d3.selectAll("#towns svg g").remove();
            prepareDataForAll(_.where(data, {season: d3.select(this).attr("value")}));
        });
    }
    if (this.value == "Time") {
        d3.select("#seasons_radio").classed("show", false);
        d3.select("#time").classed("show", true);
    }
});

d3.select("#t_cond").on("change", function() {
    prepareConditionData(this.value.toUpperCase());
    $("parallelTown").val(this.value);
    SetSelected("parallelTown",this.value)
});

function SetSelected(elem, val){
    $('#'+elem+' option').each(function(i,d){
        //  console.log('searching match for '+ elem + '  ' + d.value + ' equal to '+ val);
        if($.trim(d.value).toLowerCase() == $.trim(val).toLowerCase()){
            //      console.log('found match for '+ elem + '  ' + d.value);
            $('#'+elem).prop('selectedIndex', i);
        }
    });
}

var prepareConditionData = function(value) {
    d3.selectAll("#townCondition svg g").remove();
    var seasons = ["winter", "spring", "summer", "fall"];
    for (var i = 0; i<4; i++) {
        var dt = _.where(data, {season: seasons[i], town: value});
        var dt = _.filter(dt, function(d) {
            if ( (d.road_cond == "Snow" || d.road_cond == "Ice" || 
               d.road_cond == "Wet" || d.road_cond == "Slush" || 
               d.road_cond == "Dry") && 
                (d.light_cond == "Dark - lighted roadway" || d.light_cond == "Dark - roadway not lighted"
                 || d.light_cond == "Dawn" || d.light_cond == "Daylight" || d.light_cond == "Dusk") )
                return true;
            return false;
        });
        var groups = _.groupBy(dt, function(val) { return val.road_cond + "#" + val.light_cond; });
        var dt = _.map(groups, function(group) {
            return { road: group[0].road_cond, light: group[0].light_cond, count: group.length };
        });
        var svg = d3.select("#townCondition #" + seasons[i]);
        heatMap.call(svg, {data: dt});
    }
};

var prepareDataForAll = function(useData) {
    var mapData = _.chain(useData).groupBy("town").map(function(values, key) {
        return {type : key, 
               crashes: values.length}; //_.pluck(values, 'time_bin')
    }).value();
    mapData.sort(function(a, b) {
       if (a.crashes > b.crashes)
           return 1;
        if (a.crashes < b.crashes)
           return -1;
        return 0;
    });
    var towns = d3.set();
    mapData.forEach(function(d, i){ towns.add(d.type); });
    var xScale = d3.scale.ordinal()
                    .domain(towns.values())
                    .rangeBands([0, width-margin.right-margin.left]);
    var yval = d3.max(mapData, function(d){ return d.crashes; });
    var yScale = d3.scale.linear()
                         .domain([0, yval]).nice()
                         .range([height, margin.top+margin.bottom]);
    var svg = d3.select("#towns svg");
    barChart.call(svg, {data: mapData,
                        xScale: xScale,
                        yScale: yScale,
                        gap: 3,
                        cScale: color});
};

var barChart = function(params) {
    height=420
    var xAxis = d3.svg.axis().scale(params.xScale)
                             .orient("bottom");
    this.append("g").attr("class", "x axis")
                    .attr("transform", "translate("+margin.left+","+(height-margin.bottom)+")")
                    .call(xAxis)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", -10)
                    .attr("dy", -5)
                    .attr("transform", "translate(0,0) rotate(-90)");
    var yAxis = d3.svg.axis().scale(params.yScale)
                             .orient("left")
                             .innerTickSize(-width+margin.left+margin.right)
                             .outerTickSize(0);
    this.append("g").attr("class", "y axis")
                    .attr("transform", "translate("+margin.left+",-"+margin.bottom+")")
                    .call(yAxis);

    this.append("g").attr("class", "draw-region")
        .selectAll("rect")
        .data(params.data)
        .enter()
        .append("rect")
        .attr("width", params.xScale.rangeBand()-params.gap)
        .attr("height", function(d, i){
                            return height - params.yScale(d.crashes);
                        })
        .attr("y", function(d, i){
                return params.yScale(d.crashes) - margin.bottom;
            })
        .attr("x", function(d, i){
                return params.xScale(d.type) + margin.left;
            })
        .attr("fill", function(d, i){ 
                return params.cScale(d.type);
            })
        .style("opacity", 1.0);

    this.append("g").attr("class", "x label")
        .append("text").attr("x", (width)/2)
        .attr("y", height+40)
        .attr("text-anchor", "middle")
        .text("Towns");

    this.append("g").attr("class", "y label")
        .attr("transform", "rotate(-90)")
        .append("text").attr("x", -(height-margin.left-margin.right)/2)
        .attr("y",15).attr("text-anchor", "middle")
        .text("Crash Frequency");
};        

var heatMap = function(params) {            
    var roadLabels = ["Snow", "Ice", "Wet", "Slush", "Dry"]; //rows
    var lightLabels = ["Dark-lighted", "Dawn", "Daylight", "Dusk", "Dark-not lighted"]; //columns
    var width = 300
        height = 300
        var rows = 5, cols = 5;
    function cell_dim(total, cells) { return Math.floor(total/cells); }
    var row_height = cell_dim(height, rows);
    var col_width = cell_dim(width, cols);

    var matrix = [];
    for (var i = 0; i < (rows * cols); i++){
        matrix.push(0);
    }
    params.data.forEach(function(d, i){
        var ridx = _.indexOf(roadLabels, d.road);
        var cidx = _.indexOf(lightLabels, d.light);
        if ( ridx > -1 && cidx > -1) {
            matrix[(ridx*cols+cidx)] = d.count;
        }
    });
    var colorScale = d3.scale.linear()
                    .domain(d3.extent(matrix))
                    .range(["#ffe5e5", "#ff0000"]);

    this.attr("width", width + 50)
        .attr("height", height+ 150);
    this.append("g")
        .attr("transform", "translate(50, 0)")
        .selectAll("rect")
        .data(matrix)
        .enter()
        .append("rect")
        .attr("x", function(d,i) { return i % rows * row_height; })
        .attr("y", function(d,i) { return Math.floor(i / rows) * col_width; })
        .attr("width", col_width)
        .attr("height", row_height)
        .attr("fill", function(d) { return colorScale(d); })
        .style("stroke", "white");
    this.append("g")
        .selectAll("text").data(roadLabels)
        .enter()
        .append("text")
        .attr("x", 8)
        .attr("y", function(d,i) { return i * col_width + 20; })
        .text(function(d) {return d;});
    this.append("g")
        .attr("transform", "translate(0,0) rotate(-90)")
        .selectAll("text").data(lightLabels)
        .enter()
        .append("text")
        .attr("x", -(height+10))
        .attr("y", function(d,i) { return i * row_height + 70; })
        .attr("text-anchor", "end")
        .text(function(d) {return d;});
};

function cell_dim(total, cells) { return Math.floor(total/cells) }