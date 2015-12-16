$("#radioControls").buttonset();
  createThemeRiver(false);

createRadarChart(false);
$("#parallelTown").change(function () {
    if($('#radioSeason').is(':checked')) {
        createRadarChart(true);
        createThemeRiver(true);

        SetSelected("t_cond",this.value)
    }
    if($('#radioTime').is(':checked'))
    {
        createRadarChart(false);
        createThemeRiver(false);
        SetSelected("t_cond",this.value);
    }
});

  $("#radioSeason").change(function () {
      createThemeRiver(true);
      createRadarChart(true);
  });

  $("#radioTime").change(function () {
      createThemeRiver(false);
      createRadarChart(false);
  });

function createRadarChart(isSeason)
{
    var RadarChart = {
        draw: function(id, d, options){
            var cfg = {
                radius: 2,
                w: 400,
                h: 400,
                factor: 1,
                factorLegend: .85,
                levels: 4,
                maxValue: 0,
                radians: 2 * Math.PI,
                opacityArea: 0.5,
                ToRight: 5,
                TranslateX: 80,
                TranslateY: 30,
                ExtraWidthX: 400,
                ExtraWidthY: 100,
                color: d3.scale.category10()
            };

            if('undefined' !== typeof options){
                for(var i in options){
                    if('undefined' !== typeof options[i]){
                        cfg[i] = options[i];
                    }
                }
            }
            cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i){return d3.max(i.map(function(o){return o.value;}))}));
            var allAxis = (d[0].map(function(i, j){return i.axis}));
            var total = allAxis.length;
            var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
            var Format = d3.format("d");
            d3.select(id).select("svg").remove();

            var g = d3.select(id)
                .append("svg")
                .attr("width", cfg.w+cfg.ExtraWidthX)
                .attr("height", cfg.h+cfg.ExtraWidthY)
                .append("g")
                .attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");
            ;

            var tooltip;

            //Circular segments
            for(var j=0; j<cfg.levels-1; j++){
                var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
                g.selectAll(".levels")
                    .data(allAxis)
                    .enter()
                    .append("svg:line")
                    .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
                    .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
                    .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
                    .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
                    .attr("class", "line")
                    .style("stroke", "grey")
                    .style("stroke-opacity", "0.75")
                    .style("stroke-width", "0.3px")
                    .attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");
            }

            //Text indicating at what % each level is
            for(var j=0; j<cfg.levels; j++){
                var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
                g.selectAll(".levels")
                    .data([1]) //dummy data
                    .enter()
                    .append("svg:text")
                    .attr("x", function(d){return levelFactor*(1-cfg.factor*Math.sin(0));})
                    .attr("y", function(d){return levelFactor*(1-cfg.factor*Math.cos(0));})
                    .attr("class", "legend")
                    .style("font-family", "sans-serif")
                    .style("font-size", "10px")
                    .attr("transform", "translate(" + (cfg.w/2-levelFactor + cfg.ToRight) + ", " + (cfg.h/2-levelFactor) + ")")
                    .attr("fill", "#737373")
                    .text(Format((j+1)*cfg.maxValue/cfg.levels));
            }

            series = 0;

            var axis = g.selectAll(".axis")
                .data(allAxis)
                .enter()
                .append("g")
                .attr("class", "axis");

            axis.append("line")
                .attr("x1", cfg.w/2)
                .attr("y1", cfg.h/2)
                .attr("x2", function(d, i){return cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
                .attr("y2", function(d, i){return cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
                .attr("class", "line")
                .style("stroke", "grey")
                .style("stroke-width", "1px");

            axis.append("text")
                .attr("class", "legend")
                .text(function(d){return d})
                .style("font-family", "sans-serif")
                .style("font-size", "11px")
                .attr("text-anchor", "middle")
                .attr("dy", "1.5em")
                .attr("transform", function(d, i){return "translate(0, -10)"})
                .attr("x", function(d, i){return cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-60*Math.sin(i*cfg.radians/total);})
                .attr("y", function(d, i){return cfg.h/2*(1-Math.cos(i*cfg.radians/total))-20*Math.cos(i*cfg.radians/total);});


            d.forEach(function(y, x){
                dataValues = [];
                g.selectAll(".nodes")
                    .data(y, function(j, i){
                        dataValues.push([
                            cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)),
                            cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
                        ]);
                    });
                dataValues.push(dataValues[0]);
                g.selectAll(".area")
                    .data([dataValues])
                    .enter()
                    .append("polygon")
                    .attr("class", "radar-chart-serie"+series)
                    .style("stroke-width", "1.2px")
                    .style("stroke", cfg.color(series))
                    .attr("points",function(d) {
                        var str="";
                        for(var pti=0;pti<d.length;pti++){
                            str=str+d[pti][0]+","+d[pti][1]+" ";
                        }
                        return str;
                    })
                    .style("fill", function(j, i){return cfg.color(series)})
                    .style("fill-opacity", cfg.opacityArea)
                    .on('mouseover', function (d){
                        z = "polygon."+d3.select(this).attr("class");
                        g.selectAll("polygon")
                            .transition(200)
                            .style("fill-opacity", 0.1);
                        g.selectAll(z)
                            .transition(200)
                            .style("fill-opacity", .7);
                    })
                    .on('mouseout', function(){
                        g.selectAll("polygon")
                            .transition(200)
                            .style("fill-opacity", cfg.opacityArea);
                    });
                series++;
            });
            series=0;


            d.forEach(function(y, x){
                g.selectAll(".nodes")
                    .data(y).enter()
                    .append("svg:circle")
                    .attr("class", "radar-chart-serie"+series)
                    .attr('r', cfg.radius)
                    .attr("alt", function(j){return Math.max(j.value, 0)})
                    .attr("cx", function(j, i){
                        dataValues.push([
                            cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)),
                            cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
                        ]);
                        return cfg.w/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total));
                    })
                    .attr("cy", function(j, i){
                        return cfg.h/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total));
                    })
                    .attr("data-id", function(j){return j.axis})
                    .style("fill", cfg.color(series)).style("fill-opacity", .9)
                    .on('mouseover', function (d){
                        newX =  parseFloat(d3.select(this).attr('cx')) - 10;
                        newY =  parseFloat(d3.select(this).attr('cy')) - 5;

                        tooltip
                            .attr('x', newX)
                            .attr('y', newY)
                            .text(Format(d.value))
                            .transition(200)
                            .style('opacity', 1);

                        z = "polygon."+d3.select(this).attr("class");
                        g.selectAll("polygon")
                            .transition(200)
                            .style("fill-opacity", 0.1);
                        g.selectAll(z)
                            .transition(200)
                            .style("fill-opacity", .7);
                    })
                    .on('mouseout', function(){
                        tooltip
                            .transition(200)
                            .style('opacity', 0);
                        g.selectAll("polygon")
                            .transition(200)
                            .style("fill-opacity", cfg.opacityArea);
                    })
                    .append("svg:title")
                    .text(function(j){return Math.max(j.value, 0)});

                series++;
            });
            //Tooltip
            tooltip = g.append('text')
                .style('opacity', 0)
                .style('font-family', 'sans-serif')
                .style('font-size', '13px');
        }
    };
var csvPath
if(isSeason)
{
    csvPath="data/street_season.csv"
}
else
{
    csvPath="data/street_time.csv"
}
    var graph = d3.csv(csvPath, function(data) {

        data = data.filter(function (row) {
            return row['City'] == $('#parallelTown').val();

        })

        var LegendOptions = getStreets(data);
        data= csv2json(data);
        var w = 500,
            h = 500;

        var colorscale = d3.scale.category10();

//Legend titles


//Data


//Options for the Radar chart, other than default
        var mycfg = {
            w: w,
            h: h,
            maxValue: 1,
            levels: 5,
            ExtraWidthX: 300
        }

//Call function to draw the Radar chart
//Will expect that data is in %'s
        RadarChart.draw("#radarContainer", data, null);

////////////////////////////////////////////
/////////// Initiate legend ////////////////
////////////////////////////////////////////

        var svg = d3.select('#radarContainer')
            .selectAll('svg')
            .append('svg')
            .attr("width", w + 300)
            .attr("height", h)

//Create the title for the legend
        var text = svg.append("text")
            .attr("class", "title")
            .attr('transform', 'translate(90,0)')
            .attr("x", w )
            .attr("y", 10)
            .attr("font-size", "12px")
            .attr("fill", "#404040")
            .text("Street Names");

//Initiate Legend
        var legend = svg.append("g")
                .attr("class", "legend")
                .attr("height", 100)
                .attr("width", 200)
                .attr('transform', 'translate(90,20)')
            ;
        //Create colour squares
        legend.selectAll('rect')
            .data(LegendOptions)
            .enter()
            .append("rect")
            .attr("x", w +20)
            .attr("y", function (d, i) {
                return i * 20;
            })
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function (d, i) {
                return colorscale(i);
            })
        ;
        //Create text next to squares
        legend.selectAll('text')
            .data(LegendOptions)
            .enter()
            .append("text")
            .attr("x", w +50)
            .attr("y", function (d, i) {
                return i * 20 + 9;
            })
            .attr("font-size", "11px")
            .attr("fill", "#737373")
            .text(function (d) {
                return d;
            })
        ;
    });
}



  ( function( window ) {

      'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

      function classReg( className ) {
          return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
      }

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
      var hasClass, addClass, removeClass;

      if ( 'classList' in document.documentElement ) {
          hasClass = function( elem, c ) {
              return elem.classList.contains( c );
          };
          addClass = function( elem, c ) {
              elem.classList.add( c );
          };
          removeClass = function( elem, c ) {
              elem.classList.remove( c );
          };
      }
      else {
          hasClass = function( elem, c ) {
              return classReg( c ).test( elem.className );
          };
          addClass = function( elem, c ) {
              if ( !hasClass( elem, c ) ) {
                  elem.className = elem.className + ' ' + c;
              }
          };
          removeClass = function( elem, c ) {
              elem.className = elem.className.replace( classReg( c ), ' ' );
          };
      }

      function toggleClass( elem, c ) {
          var fn = hasClass( elem, c ) ? removeClass : addClass;
          fn( elem, c );
      }

      var classie = {
          // full names
          hasClass: hasClass,
          addClass: addClass,
          removeClass: removeClass,
          toggleClass: toggleClass,
          // short names
          has: hasClass,
          add: addClass,
          remove: removeClass,
          toggle: toggleClass
      };

// transport
      if ( typeof define === 'function' && define.amd ) {
          // AMD
          define( classie );
      } else {
          // browser global
          window.classie = classie;
      }

  })( window );

  function init() {
      window.addEventListener('scroll', function(e){
          //var distanceY = window.pageYOffset || document.documentElement.scrollTop,
          //    shrinkOn = 300,
          //    header = document.querySelector("header");
          //if (distanceY > shrinkOn) {
          //    classie.add(header,"smaller");
          //} else {
          //    if (classie.has(header,"smaller")) {
          //        classie.remove(header,"smaller");
          //    }
          //}
          $("#towns:in-viewport").each(function() {
              if($(this).attr('ID')=="towns")
              {

                  $("#viewTitle").html("You can see how the seasons and time of the day influence the frequency of crashes in each town")
                  $("#viewControls2").hide()
                  $("#viewControls1").show()
                  $("#viewControls3").hide()

              }
          });

          $("#riverOuter:in-viewport").each(function() {
              $("#viewTitle").html("You can see top streets in the town with most crashes and how they vary with time and seasons")
           if($(this).attr('ID')=="riverOuter")
           {
               $("#viewControls1").hide()
               $("#viewControls3").show()
               $("#viewControls2").hide()
           }


          });

          $("#townCondition:in-viewport").each(function() {
              $("#viewTitle").html("You can see how the frequency of crashes vary with road and light conditions in each town")
          if($(this).attr('ID')=="townCondition")
          {
              $("#viewControls1").hide()
              $("#viewControls2").show()
              $("#viewControls3").hide()

          }
          });

          $("#themeRiverContainer:in-viewport").each(function() {
              if($(this).attr('ID')=="themeRiverContainer")
              {
                  $("#viewTitle").html("You can see the type of vehicles involved in accidents in each town and how they vary with seasons and time")
                  $("#viewControls1").hide()
                  $("#viewControls3").show()
                  $("#viewControls2").hide()

              }
          });



      });
  }
  window.onload = init();


function createThemeRiver(isSeason) {

    $('#themeRiverContainer').empty();
    var csvPath
    if(isSeason)
    {
        csvPath="data/season&type.csv"
    }
    else
    {
        csvPath="data/city&type.csv"
    }
    chart(csvPath, "orange",isSeason);

    var datearray = [];
    var colorrange = [];
}

function chart(csvpath, color,isSeason) {

    if (color == "blue") {
        colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
    }
    else if (color == "pink") {
        colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
    }
    else if (color == "orange") {
        colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
    }
    strokecolor = colorrange[0];

    var format = d3.time.format("%m/%d/%y");

    var margin = {top: 20, right: 50, bottom: 50, left: 80};
    var width = document.body.clientWidth - margin.left - margin.right;
    width=width-150
    var height = 400 - margin.top - margin.bottom;

    var tooltip = d3.select("#themeRiverContainer")
        .append("div")
        .attr("class", "remove")
        .style("position", "relative")
        .style("text-align", "center")
        .style("height", "30px")
        .style("z-index", "20")
        .style("visibility", "hidden")
        .style("top", "30px")
        .style("left", "55px");

    var x = d3.scale.ordinal()
        .rangePoints([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var z = d3.scale.ordinal()
        .range(colorrange);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
    //.ticks(d3.time.weeks);

    var yAxis = d3.svg.axis()
        .scale(y);

    var yAxisr = d3.svg.axis()
        .scale(y);

    var stack = d3.layout.stack()
        .offset("silhouette")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.date; })
        .y(function(d) { return d.value; });

    var nest = d3.nest()
        .key(function(d) { return d.key; });

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return x(d.date); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });

    var svgTheme = d3.select("#themeRiverContainer").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var graph = d3.csv(csvpath, function(data) {

        data = data.filter(function (row) {
            return row['City'] == $('#parallelTown').val();

        })
        var headers
        if(isSeason) {
            headers = ['fall','spring','winter','summer'];
        }
        else {
             headers = ['12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'];
        }
        var dataArray=[]
        var modData = (headers.map(function(value) {
            return data.map(function(d) {
                var t={key: d.Type,date: value, value: +d[value]};
                dataArray.push(t);
                return {key: d.Type,date: value, value: +d[value]};
            });
        }));
//               data.forEach(function(d) {
//                   d.date = format.parse(d.date);
//                   d.value = +d.value;
//               });
        data=dataArray;
        var layers = stack(nest.entries(dataArray));

        //x.domain(d3.extent(dataArray, function(d) { return d.date; }));
        y.domain([0, d3.max(dataArray, function(d) { return d.y0 + d.y; })]);

        x.domain(headers);
        //y.domain([0, 300]);
        svgTheme.selectAll(".layer")
            .data(layers)
            .enter().append("path")
            .attr("class", "layer")
            .attr("d", function(d) { return area(d.values); })
            .style("fill", function(d, i) { return z(i); });

        if(isSeason) {
            svgTheme.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)

                .append("text")
                .attr("x", width/2)
                .attr("y",35)
                .style("text-anchor", "middle")
                .text("Season");
            ;
        }
        else
        {

            svgTheme.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .append("text")
                .attr("x", width/2)
                .attr("y",35)
                .style("text-anchor", "middle")
                .text("Time");
            ;
        }


        svgTheme.append("g")
            .attr("class", "y axis")
            .call(yAxis.orient("left"))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr("x", -130)
            .attr("dy", ".71em")
            .style("text-anchor", "middle")
            .text("Number of crashes");;

        svgTheme.selectAll(".layer")
            .attr("opacity", 1)
            .on("mouseover", function(d, i) {
                svgTheme.selectAll(".layer").transition()
                    .duration(250)
                    .attr("opacity", function(d, j) {
                        return j != i ? 0.6 : 1;
                    })})

            .on("mousemove", function(d, i) {
                var xPos = d3.mouse(this)[0];

                //console.log(imageScale.invert(xPos));
                var leftEdges = x.range();
                var width = x.rangeBand();
                var j;
                for(j=0; xPos > (leftEdges[j] + width); j++) {}
                //do nothing, just increment j until case fails

                var pro= d.values[j].value;


//                           mousex = d3.mouse(this);
//                           mousex = mousex[0];
//                          var invertedx = x.invert(mousex);
//                           invertedx = invertedx.getMonth() + invertedx.getDate();
//                           var selected = (d.values);
//                           for (var k = 0; k < selected.length; k++) {
//                               datearray[k] = selected[k].date
//                               datearray[k] = datearray[k].getMonth() + datearray[k].getDate();
                // }

//                          mousedate = datearray.indexOf(invertedx);
//                           pro = d.values[mousedate].value;

                d3.select(this)
                    .classed("hover", true)
                    .attr("stroke", strokecolor)
                    .attr("stroke-width", "0.5px"),
                    tooltip.html( "<p>" + d.key  + "<br>" + pro + "</p>" ).style("visibility", "visible");

            })
            .on("mouseout", function(d, i) {
                svgTheme.selectAll(".layer")
                    .transition()
                    .duration(250)
                    .attr("opacity", "1");
                d3.select(this)
                    .classed("hover", false)
                    .attr("stroke-width", "0px"), tooltip.html( "<p>" + d.key  + "</p>" ).style("visibility", "hidden");
            })

        var vertical = d3.select("#themeRiverContainer")
            .append("div")
            .attr("class", "remove")
            .style("position", "absolute")
            .style("z-index", "19")
            .style("width", "1px")
            .style("height", "380px")
            .style("top", "10px")
            .style("bottom", "30px")
            .style("left", "0px")
            .style("background", "#fff");

        d3.select("#themeRiverContainer")
            .on("mousemove", function(){
                mousex = d3.mouse(this);
                mousex = mousex[0] + 5;
                vertical.style("left", mousex + "px" )})
            .on("mouseover", function(){
                mousex = d3.mouse(this);
                mousex = mousex[0] + 5;
                vertical.style("left", mousex + "px")});
    });
}



function createParallelPlot() {
    $('#parallelContainer').empty();
    var marginParallel = {top: 30, right: 220, bottom: 10, left: 220},
        widthParallel = document.body.clientWidth - marginParallel.left - marginParallel.right,
        heightParallel = 700 - marginParallel.top - marginParallel.bottom;

    var xParallel = d3.scale.ordinal().rangePoints([0, widthParallel], 1),
        yParallel = {},
        draggingParallel = {};

    var lineParallel = d3.svg.line(),
        axisParallel = d3.svg.axis().orient("left"),
        backgroundParallel,
        foregroundParallel;

    var svgParallel = d3.select("#parallelContainer").append("svg")
        .attr("width", widthParallel + marginParallel.left + marginParallel.right)
        .attr("height", heightParallel + marginParallel.top + marginParallel.bottom)
        .append("g")
        .attr("transform", "translate(" + marginParallel.left + "," + marginParallel.top + ")");

    d3.csv("street&time - Copy.csv", function (error, streets) {
        streets = streets.filter(function (row) {
            return row['City'] == $('#parallelTown').val();
            ;
        })
        // Extract the list of dimensionsParallel and create a scale for each.
        xParallel.domain(dimensionsParallel = d3.keys(streets[0]).filter(function (d) {
            if (d === "City") return false;

            if (d === "Street") {
                yParallel[d] = d3.scale.ordinal()
                    .domain(streets.map(function (p) {
                        return p[d];
                    }))
                    .rangePoints([heightParallel, 0]);

            }
            else {
                yParallel[d] = d3.scale.linear()
                    .domain([0,25])

                    .range([heightParallel, 0]);
            }

            return true;
        }));

        // Add grey background lines for context.
        backgroundParallel = svgParallel.append("g")
            .attr("class", "background")
            .selectAll("path")
            .data(streets)
            .enter().append("path")
            .attr("d", path);

        // Add blue foreground lines for focus.
        foregroundParallel = svgParallel.append("g")
            .attr("class", "foreground")
            .selectAll("path")
            .data(streets)
            .enter().append("path")
            .attr("d", path);

        // Add a group element for each dimension.
        var gParallel = svgParallel.selectAll(".dimension")
            .data(dimensionsParallel)
            .enter().append("g")
            .attr("class", "dimension")
            .attr("transform", function (d) {
                return "translate(" + xParallel(d) + ")";
            })
            .call(d3.behavior.drag()
                .origin(function (d) {
                    return {x: xParallel(d)};
                })
                .on("dragstart", function (d) {
                    draggingParallel[d] = xParallel(d);
                    backgroundParallel.attr("visibility", "hidden");
                })
                .on("drag", function (d) {
                    draggingParallel[d] = Math.min(widthParallel, Math.max(0, d3.event.x));
                    foregroundParallel.attr("d", path);
                    dimensionsParallel.sort(function (a, b) {
                        return position(a) - position(b);
                    });
                    xParallel.domain(dimensionsParallel);
                    gParallel.attr("transform", function (d) {
                        return "translate(" + position(d) + ")";
                    })
                })
                .on("dragend", function (d) {
                    delete draggingParallel[d];
                    transition(d3.select(this)).attr("transform", "translate(" + xParallel(d) + ")");
                    transition(foregroundParallel).attr("d", path);
                    backgroundParallel
                        .attr("d", path)
                        .transition()
                        .delay(500)
                        .duration(0)
                        .attr("visibility", null);
                }));

        // Add an axis and title.
        gParallel.append("g")
            .attr("class", "axis")
            .each(function (d) {
                d3.select(this).call(axisParallel.scale(yParallel[d]));
            })
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function (d) {
                return d;
            });

        // Add and store a brush for each axis.
        gParallel.append("g")
            .attr("class", "brush")
            .each(function (d) {
                d3.select(this).call(yParallel[d].brush = d3.svg.brush().y(yParallel[d]).on("brushstart", brushstart).on("brush", brush));
            })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);
    });

    function position(d) {
        var v = draggingParallel[d];
        return v == null ? xParallel(d) : v;
    }

    function transition(g) {
        return g.transition().duration(500);
    }

    // Returns the path for a given data point.
    function path(d) {
        return lineParallel(dimensionsParallel.map(function (p) {
            return [position(p), yParallel[p](d[p])];
        }));
    }

    function brushstart() {
        d3.event.sourceEvent.stopPropagation();
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
        var actives = dimensionsParallel.filter(function (p) {
                return !yParallel[p].brush.empty();
            }),
            extents = actives.map(function (p) {
                return yParallel[p].brush.extent();
            });
        foregroundParallel.style("display", function (d) {
            return actives.every(function (p, i) {
                return extents[i][0] <= d[p] && d[p] <= extents[i][1];
            }) ? null : "none";
        });
    }


}



function csv2json(csv) {
//        csv = csv.replace(/, /g, ","); // trim leading whitespace in csv file
//        var json = d3.csv.parse(csv); // parse csv string into json
//        // reshape json data
    var data = [];
    var groups = []; // track unique groups
    var json=[];
    csv.forEach(function(record) {
        var group = record.Street;
        if (groups.indexOf(group) < 0) {
            groups.push(group); // push to unique groups tracking
            data.push({ // push group node in data
                group: group,
                axis: []
            });
        };

        data.forEach(function(d) {
            if (d.group === record.Street) { // push record data into right group in data
                d.axis.push({
                    axis: record.Time,
                    value: parseInt(record.value),
                    description: record.Strret
                });
            }
        });
    });

    data.forEach(function(d,i) {
        if(i<5)
            json[i]= d.axis;
    });

    return json;
}

  function getStreets(csv) {
//        csv = csv.replace(/, /g, ","); // trim leading whitespace in csv file
//        var json = d3.csv.parse(csv); // parse csv string into json
//        // reshape json data
      var data = [];
      var groups = []; // track unique groups
      var json = [];
      csv.forEach(function (record) {
          var group = record.Street;
          if (groups.indexOf(group) < 0) {
              groups.push(group); // push to unique groups tracking
              data.push(group);
          }
          ;



      });
      return data.splice(0,5);
  }