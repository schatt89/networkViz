// svg objects
var link_left, node_left, link_right, node_right;
// the data - an object with nodes and links
var graph_left, graph_right;

// load the data

function network_from_selected_data (sel) {
    if (sel == 1) {
        var name = "data/before.json";
    } else if (sel == 2) {
        var name = "data/during.json"
    } else if (sel == 3) {
        var name = "data/data.json"   
    } else if (sel == 4) {
        var name = "data/data2.json"
    }
    d3.json(name, function(error, _graph) {
        if (error) throw error;
        var side = window.side;
        window['graph' + "_" + side] = _graph;
        console.log(side);
        initializeDisplay(side);
        initializeSimulation(side);
        });
}

function select_data (index, side) {

    var x = document.getElementById(side + "_select")
    window.side = side;
    var selection = x.options[index].index;

    window['svg' + "_" + side] = d3.select("#" + side + "_svg");
    window['svg' + "_" + side].selectAll("*").remove();

    network_from_selected_data(selection);
}

//////////// UPLOADING A CUSTOM FILE //////////////

document.getElementById('left_import').onclick = function() {
    const files = document.getElementById('left_file').files;
    console.log(files);
    if (files.length <= 0) {
      return false;
    }
    
    var fr = new FileReader();
    
    fr.onload = async function(e) { 
    console.log(e);
      const result = JSON.parse(e.target.result);
      console.log(result)
      var formatted = JSON.stringify(result, null, 2);
      document.getElementById('left_result').value = formatted;
      const response = await fetch("/api", { 
          method: "POST",
          body: formatted,
          headers: {"Content-Type": "application/json"}
      })
      const d = await response.json();
      console.log(d);
  
      d3.selectAll("#left_svg > *").remove();
      var root = d.data;
      graph_left = root;
      initializeDisplay("left");
      initializeSimulation("left");
  
    }
    
    fr.readAsText(files.item(0));
  
  }

  document.getElementById('right_import').onclick = function() {
    const files = document.getElementById('right_file').files;
    console.log(files);
    if (files.length <= 0) {
      return false;
    }
    
    var fr = new FileReader();
    
    fr.onload = async function(e) { 
    console.log(e);
      const result = JSON.parse(e.target.result);
      console.log(result)
      var formatted = JSON.stringify(result, null, 2);
      document.getElementById('right_result').value = formatted;
      const response = await fetch("/api", { 
          method: "POST",
          body: formatted,
          headers: {"Content-Type": "application/json"}
      })
      const d = await response.json();
  
      d3.selectAll("#right_svg > *").remove();
      var root = d.data;
      graph_right = root;
      initializeDisplay("right");
      initializeSimulation("right");
  
    }
    
    fr.readAsText(files.item(0));
  
  }

/// UI events ///

var i = 0;
var dragging = false;
   $('#dragbar').mousedown(function(e){
       e.preventDefault();
       
       dragging = true;
       var main = $('#main');
       var ghostbar = $('<div>',
                        {id:'ghostbar',
                         css: {
                                height: main.outerHeight(),
                                top: main.offset().top,
                                left: main.offset().left
                               }
                        }).appendTo('body');
       
        $(document).mousemove(function(e){
          ghostbar.css("left",e.pageX+2);
       });
       
    });

   $(document).mouseup(function(e){
       if (dragging) 
       {
           var percentage = (e.pageX / window.innerWidth) * 100;
           var mainPercentage = 100-percentage;
           
           $('#console').text("side:" + percentage + " main:" + mainPercentage);
           
           $('#sidebar').css("width",percentage + "%");
           $('#main').css("width",mainPercentage + "%");
           $('#ghostbar').remove();
           $(document).unbind('mousemove');
           dragging = false;
       }
    });

//// CLEAR SVG //////

document.getElementById('left_clear').onclick = function() {
    svg.selectAll("#left_svg > *").remove();
}

document.getElementById('right_clear').onclick = function() {
    svg.selectAll("#right_svg > *").remove();
}

//////////// FORCE SIMULATION //////////// 

// force simulator
var simulation_left = d3.forceSimulation();
var simulation_right = d3.forceSimulation();

// set up the simulation and event to update locations after each tick
function initializeSimulation(side) {
window['svg' + "_" + side] = d3.select("#" + side + "_svg")
window['width' + "_" + side] = +window['svg' + "_" + side].node().getBoundingClientRect().width,
window['height' + "_" + side] = +window['svg' + "_" + side].node().getBoundingClientRect().height;
window['simulation' + "_" + side].nodes(window['graph' + "_" + side].nodes);
initializeForces(side);
window['simulation' + "_" + side].on("tick", ticked);
}

// values for all forces
forceProperties_left = {
center: {
    x: 0.5,
    y: 0.5
},
charge: {
    enabled: true,
    strength: -30, 
    distanceMin: 1,
    distanceMax: 2000
},
collide: {
    enabled: true,
    strength: .7,
    iterations: 1,
    radius: 5
},
forceX: {
    enabled: false,
    strength: .1,
    x: .5
},
forceY: {
    enabled: false,
    strength: .1,
    y: .5
},
link: {
    enabled: true,
    distance: 30,
    iterations: 1
}
}

forceProperties_right = {
    center: {
        x: 0.5,
        y: 0.5
    },
    charge: {
        enabled: true,
        strength: -30, 
        distanceMin: 1,
        distanceMax: 2000
    },
    collide: {
        enabled: true,
        strength: .7,
        iterations: 1,
        radius: 5
    },
    forceX: {
        enabled: false,
        strength: .1,
        x: .5
    },
    forceY: {
        enabled: false,
        strength: .1,
        y: .5
    },
    link: {
        enabled: true,
        distance: 30,
        iterations: 1
    }
    }

// add forces to the simulation
function initializeForces(side) {
// add forces and associate each with a name
window['simulation' + "_" + side]
    .force("link", d3.forceLink())
    .force("charge", d3.forceManyBody())
    .force("collide", d3.forceCollide())
    .force("center", d3.forceCenter())
    .force("forceX", d3.forceX())
    .force("forceY", d3.forceY());
// apply properties to each of the forces
updateForces(side);
}

// apply new force properties
function updateForces(side) {
// get each force by name and update the properties
window['simulation' + "_" + side].force("center")
    .x(window['width' + "_" + side] * window['forceProperties' + "_" + side].center.x)
    .y(window['height' + "_" + side] * window['forceProperties' + "_" + side].center.y);

window['simulation' + "_" + side].force("charge")
    .strength(window['forceProperties' + "_" + side].charge.strength * window['forceProperties' + "_" + side].charge.enabled)
    .distanceMin(window['forceProperties' + "_" + side].charge.distanceMin)
    .distanceMax(window['forceProperties' + "_" + side].charge.distanceMax);
window['simulation' + "_" + side].force("collide")
    .strength(window['forceProperties' + "_" + side].collide.strength * window['forceProperties' + "_" + side].collide.enabled)
    .radius(window['forceProperties' + "_" + side].collide.radius)
    .iterations(window['forceProperties' + "_" + side].collide.iterations);
window['simulation' + "_" + side].force("forceX")
    .strength(window['forceProperties' + "_" + side].forceX.strength * window['forceProperties' + "_" + side].forceX.enabled)
    .x(window['width' + "_" + side] * window['forceProperties' + "_" + side].forceX.x);
window['simulation' + "_" + side].force("forceY")
    .strength(window['forceProperties' + "_" + side].forceY.strength * window['forceProperties' + "_" + side].forceY.enabled)
    .y(window['heigth' + "_" + side] * window['forceProperties' + "_" + side].forceY.y);
window['simulation' + "_" + side].force("link")
    .id(function(d) {return d.id;})
    .distance(window['forceProperties' + "_" + side].link.distance)
    .iterations(window['forceProperties' + "_" + side].link.iterations)
    .links(window['forceProperties' + "_" + side].link.enabled ? window['graph' + "_" + side].links : []);

// updates ignored until this is run
// restarts the simulation (important if simulation has already slowed down)
window['simulation' + "_" + side].alpha(1).restart();

}
    
    //////////// DISPLAY ////////////

// generate the svg objects and force simulation
function initializeDisplay(side) {
    window['svg' + "_" + side] = d3.select("#" + side + "_svg")
    console.log(window['svg' + "_" + side])
    // set the data and properties of link lines
    window['link' + "_" + side] = window['svg' + "_" + side].append("g")
        .attr("class", "links")
    .selectAll("line")
    .data(window['graph' + "_" + side].links)
    .enter().append("line")
    .style("stroke-width", function(d) { return Math.sqrt(d.value); });
    
    // set the data and properties of node circles
    
    window['node' + "_" + side] = window['svg' + "_" + side].append("g")
        .attr("class", "nodes")
    .selectAll("circle")
    .data(window['graph' + "_" + side].nodes)
    .enter().append("circle")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    
    var net = "#" + side + "_container"
    
    // Define the div for the tooltip
    window['div' + "_" + side] = d3.select(net).append("div")	
        .attr("class", "tooltip")			
        .style("opacity", 0);
    
    // node tooltip
    window['node' + "_" + side].on("mouseover", function(d) {		
        window['div' + "_" + side].transition()		
            .duration(200)
            .style("background-color", "#eee")
            .style("opacity", .9);		
        window['div' + "_" + side].html(d.id + "<br/> Group: "  + d.group)	
            .style("left", (d3.event.pageX) - 200 + "px")		
            .style("top", (d3.event.pageY) + "px")
            .style("display", "flex")
            .style("position", "absolute");
        })					
    .on("mouseout", function(d) {		
        window['div' + "_" + side].transition()		
            .duration(500)		
            .style("opacity", 0);	
    });
    // visualize the graph
    updateDisplay(side);
    }
    
    // update the display based on the forces (but not positions)
    function updateDisplay(side) {
        //var myColor = d3.scaleOrdinal();
    
    window['node' + "_" + side]
        .attr("r", window['forceProperties' + "_" + side].collide.radius)
        .attr("stroke", window['forceProperties' + "_" + side].charge.strength > 0 ? "blue" : "red")
        .attr("stroke-width", window['forceProperties' + "_" + side].charge.enabled==false ? 0 : Math.abs(window['forceProperties' + "_" + side].charge.strength)/15)
        //.style("fill", function(d) { return myColor.domain(d.group).range(d3.schemeSet3); })
    
    window['link' + "_" + side]
        .attr("stroke-width", window['forceProperties' + "_" + side].link.enabled ? 1 : .5)
        .attr("opacity", window['forceProperties' + "_" + side].link.enabled ? 1 : 0);
    }
    
    // update the display positions after each simulation tick
    function ticked() {
    link_left
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    
    node_left
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    d3.select('#alpha_value').style('flex-basis', (simulation_left.alpha()*100) + '%');

    }
    
    //d3.select("#clusterButton").on("click", function () {
    
        /******************/
        /*  Clustering    */
        /******************/
     /*   netClustering.cluster(graph.nodes, graph.links);
        console.log(graph.nodes)
        console.log(graph.links)
    
        svg.selectAll(".node").transition().duration(2000).style("fill", function(d) { return color(d.cluster); });
      });
    */
    
    //////////// UI EVENTS ////////////
    
    function dragstarted(d) {
    if (!d3.event.active) window['simulation' + "_" + side].alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
    }
    
    function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
    }
    
    function dragended(d) {
    if (!d3.event.active) window['simulation' + "_" + side].alphaTarget(0.0001);
    d.fx = null;
    d.fy = null;
    }
    
    // update size-related forces
    d3.select("#sidebar").on("resize", function(){
    window.width_left = +window.svg_left.node().getBoundingClientRect().width;
    window.height_left = +window.svg_left.node().getBoundingClientRect().height;

    window.width_right = +window.svg_right.node().getBoundingClientRect().width;
    window.height_right = +window.svg_right.node().getBoundingClientRect().height;
    updateForces("left");
    updateForces("right");
    });
    
    // convenience function to update everything (run after UI input)
    function updateAll() {
    updateForces('left');
    updateDisplay('left');
    };
    
    document.getElementById('clusterButton').onclick = function recolor(d) {
            d3.selectAll("circle")
              .transition()
              .duration(2000)
              .style("fill", "green")
              .attr("stroke-width", 0)
    };