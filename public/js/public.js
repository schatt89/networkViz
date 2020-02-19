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


var	margin = {top: 30, right: 20, bottom: 30, left: 50},
	width = 100 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

var	chart1 = d3.select("body")
	.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        

// Adds the svg canvas
var	chart2 = d3.select("body")
	.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");