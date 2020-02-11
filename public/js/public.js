var svg = d3.select("svg"),
width = +svg.node().getBoundingClientRect().width,
height = +svg.node().getBoundingClientRect().height;

// svg objects
var link, node;
// the data - an object with nodes and links
var graph;

// load the data

function select_data (index) {
    var x = document.getElementById("mySelect");
    var selection = x.options[index].text;
    if (selection == "Option1") {
        d3.selectAll("svg > *").remove();
        d3.json("data/data.json", function(error, _graph) {
            if (error) throw error;
            graph = _graph;
            initializeDisplay();
            initializeSimulation();
            });
        alert(selection + " is selected");
    } else if (selection == "Option2") {
        d3.selectAll("svg > *").remove();
        d3.json("data/data2.json", function(error, _graph) {
            if (error) throw error;
            graph = _graph;
            initializeDisplay();
            initializeSimulation();
            });
        alert(selection + " is selected");
    }
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
.enter().append("line");

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

// node tooltip
node.append("title")
  .text(function(d) { return d.id; });
// visualize the graph
updateDisplay();
}

// update the display based on the forces (but not positions)
function updateDisplay() {
node
    .attr("r", forceProperties.collide.radius)
    .attr("stroke", forceProperties.charge.strength > 0 ? "blue" : "red")
    .attr("stroke-width", forceProperties.charge.enabled==false ? 0 : Math.abs(forceProperties.charge.strength)/15);

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