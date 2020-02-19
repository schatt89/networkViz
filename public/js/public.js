var svg = d3.select("svg"),
width = +svg.node().getBoundingClientRect().width,
height = +svg.node().getBoundingClientRect().height;

// svg objects
var link, node;
// the data - an object with nodes and links
var graph;

// load the data

function network_from_selected_data (sel) {
    if (sel == "Option1") {
        var name = "data/data.json";
    } else if (sel == "Option2") {
        var name = "data/data2.json"
    } else if (sel == "Option3") {
        alert("Option3 is not defined")
        
    }
    d3.json(name, function(error, _graph) {
        if (error) throw error;
        graph = _graph;
        initializeDisplay();
        initializeSimulation();
        });
}

function select_data (index) {
    var x = document.getElementById("mySelect");
    var selection = x.options[index].text;
    d3.selectAll("svg > *").remove();
    network_from_selected_data(selection);
}


function add_network (index) {
    var x = document.getElementById("mySelect");
    var selection = x.options[index].text;
    forceProperties.center.x = 0.8;
    network_from_selected_data(selection);
}

//////////// UPLOADING A CUSTOM FILE //////////////

document.getElementById('import').onclick = function() {
  const files = document.getElementById('selectFiles').files;
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
    document.getElementById('result').value = formatted;
    const response = await fetch("/api", { 
        method: "POST",
        body: formatted,
        headers: {"Content-Type": "application/json"}
    })
    const d = await response.json();
    console.log(d);

    d3.selectAll("svg > *").remove();
    var root = d.data;
    graph = root;
    initializeDisplay();
    initializeSimulation();

  }
  
  fr.readAsText(files.item(0));

}



//////////// FORCE SIMULATION //////////// 

// force simulator
var simulation = d3.forceSimulation();

// set up the simulation and event to update locations after each tick
function initializeSimulation() {
simulation.nodes(graph.nodes);
initializeForces();
simulation.on("tick", ticked);
}

// values for all forces
forceProperties = {
center: {
    x: 0.2,
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
function initializeForces() {
// add forces and associate each with a name
simulation
    .force("link", d3.forceLink())
    .force("charge", d3.forceManyBody())
    .force("collide", d3.forceCollide())
    .force("center", d3.forceCenter())
    .force("forceX", d3.forceX())
    .force("forceY", d3.forceY());
// apply properties to each of the forces
updateForces();
}

// apply new force properties
function updateForces() {
// get each force by name and update the properties
simulation.force("center")
    .x(width * forceProperties.center.x)
    .y(height * forceProperties.center.y);
simulation.force("charge")
    .strength(forceProperties.charge.strength * forceProperties.charge.enabled)
    .distanceMin(forceProperties.charge.distanceMin)
    .distanceMax(forceProperties.charge.distanceMax);
simulation.force("collide")
    .strength(forceProperties.collide.strength * forceProperties.collide.enabled)
    .radius(forceProperties.collide.radius)
    .iterations(forceProperties.collide.iterations);
simulation.force("forceX")
    .strength(forceProperties.forceX.strength * forceProperties.forceX.enabled)
    .x(width * forceProperties.forceX.x);
simulation.force("forceY")
    .strength(forceProperties.forceY.strength * forceProperties.forceY.enabled)
    .y(height * forceProperties.forceY.y);
simulation.force("link")
    .id(function(d) {return d.id;})
    .distance(forceProperties.link.distance)
    .iterations(forceProperties.link.iterations)
    .links(forceProperties.link.enabled ? graph.links : []);

// updates ignored until this is run
// restarts the simulation (important if simulation has already slowed down)
simulation.alpha(1).restart();
}



//////////// DISPLAY ////////////

// generate the svg objects and force simulation
function initializeDisplay() {
// set the data and properties of link lines
link = svg.append("g")
    .attr("class", "links")
.selectAll("line")
.data(graph.links)
.enter().append("line")
.style("stroke-width", function(d) { return Math.sqrt(d.value); });

// set the data and properties of node circles

node = svg.append("g")
    .attr("class", "nodes")
.selectAll("circle")
.data(graph.nodes)
.enter().append("circle")
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

// Define the div for the tooltip
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

// node tooltip
node.on("mouseover", function(d) {		
    div.transition()		
        .duration(200)		
        .style("opacity", .9);		
    div	.html(d.id + "<br/> Group:"  + d.group)	
        .style("left", (d3.event.pageX) + "px")		
        .style("top", (d3.event.pageY - 28) + "px");	
    })					
.on("mouseout", function(d) {		
    div.transition()		
        .duration(500)		
        .style("opacity", 0);	
});
// visualize the graph
updateDisplay();
}

// update the display based on the forces (but not positions)
function updateDisplay() {
    //var myColor = d3.scaleOrdinal();

node
    .attr("r", forceProperties.collide.radius)
    .attr("stroke", forceProperties.charge.strength > 0 ? "blue" : "red")
    .attr("stroke-width", forceProperties.charge.enabled==false ? 0 : Math.abs(forceProperties.charge.strength)/15)
    //.style("fill", function(d) { return myColor.domain(d.group).range(d3.schemeSet3); })

link
    .attr("stroke-width", forceProperties.link.enabled ? 1 : .5)
    .attr("opacity", forceProperties.link.enabled ? 1 : 0);
}

// update the display positions after each simulation tick
function ticked() {
link
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

node
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
d3.select('#alpha_value').style('flex-basis', (simulation.alpha()*100) + '%');
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
if (!d3.event.active) simulation.alphaTarget(0.3).restart();
d.fx = d.x;
d.fy = d.y;
}

function dragged(d) {
d.fx = d3.event.x;
d.fy = d3.event.y;
}

function dragended(d) {
if (!d3.event.active) simulation.alphaTarget(0.0001);
d.fx = null;
d.fy = null;
}

// update size-related forces
d3.select(window).on("resize", function(){
width = +svg.node().getBoundingClientRect().width;
height = +svg.node().getBoundingClientRect().height;
updateForces();
});

// convenience function to update everything (run after UI input)
function updateAll() {
updateForces();
updateDisplay();
};

document.getElementById('clusterButton').onclick = function recolor(d) {
        d3.selectAll("circle")
          .transition()
          .duration(2000)
          .style("fill", "green")
          .attr("stroke-width", 0)
};