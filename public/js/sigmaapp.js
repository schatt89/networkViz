/*! dan-network 2018-10-06 */

var filter, sg, renderer, atc = {
    A: "Alimentary tract and metabolism",
    B: "Blood and blood forming organs",
    C: "Cardiovascular system",
    D: "Dermatologicals",
    G: "Genito-urinary and sex hormones",
    H: "Systemic hormonal preparations",
    J: "Antiinfectives for systemic use",
    L: "Antineoplastic and immuno. agents",
    M: "Musculo-skeletal system",
    N: "Nervous system",
    P: "Antiparasitic, insecticides & repellents",
    R: "Respiratory system",
    S: "Sensory organs",
    V: "Various",
    X: "Others"
},
_ = {
    $: function(e) {
        return document.getElementById(e)
    },
    all: function(e) {
        return document.querySelectorAll(e)
    },
    removeClass: function(e, t) {
        var n = document.querySelectorAll(e),
            a = n.length;
        for (i = 0; i < a; i++) {
            var o = n[i];
            o.className = o.className.replace(t, "")
        }
    },
    addClass: function(e, t) {
        var n = document.querySelectorAll(e),
            a = n.length;
        for (i = 0; i < a; i++) {
            var o = n[i]; - 1 == o.className.indexOf(t) && (o.className += " " + t)
        }
    },
    show: function(e) {
        this.removeClass(e, "hidden")
    },
    hide: function(e) {
        this.addClass(e, "hidden")
    },
    toggle: function(e, t) {
        t = t || "hidden";
        var n = document.querySelectorAll(e),
            a = n.length;
        for (i = 0; i < a; i++) {
            var o = n[i]; - 1 !== o.className.indexOf(t) ? o.className = o.className.replace(t, "") : o.className += " " + t
        }
    }
};

function updatePane(t, n) {
var a = 0,
    o = {};
t.nodes().forEach(function(e) {
    a = Math.max(a, t.degree(e.id)), o[e.attributes.atc_codes_letter] = !0
}), _.$("min-degree").max = a, _.$("max-degree-value").textContent = a;
var r = _.$("node-category");
Object.keys(o).forEach(function(e) {
    var t = document.createElement("option");
    t.text = atc[e], t.value = e, r.add(t)
}), _.$("reset-btn").addEventListener("click", function(e) {
    _.$("min-degree").value = 0, _.$("min-degree-val").textContent = "0", _.$("node-category").selectedIndex = 0, n.undo().apply(), _.$("dump").textContent = "", _.hide("#dump")
})
}

function generateLinks(e, t) {
if (void 0 === e || 0 == e.length || NaN === e) return "-";
var n = e.toString().split("|");
return "cat" === t ? n[0] : "group" === t ? n[0] : "atc" === t ? n[0] : "lincs" === t ? 1 === n.length ? '<a target="_blank" href="http://lincsportal.ccs.miami.edu/SmallMolecules/view/' + n + '">' + n + "</a>" : 2 === n.length ? '<a target="_blank" href="http://lincsportal.ccs.miami.edu/SmallMolecules/view/' + n[0] + '">' + n[0] + '</a>, <a target="_blank" href="http://lincsportal.ccs.miami.edu/SmallMolecules/view/' + n[1] + '">' + n[1] + "</a>" : '<a target="_blank" href="http://lincsportal.ccs.miami.edu/SmallMolecules/view/' + n[0] + '">' + n[0] + '</a>, <a target="_blank" href="http://lincsportal.ccs.miami.edu/SmallMolecules/view/' + n[1] + '">' + n[1] + '</a>, <a target="_blank" href="http://lincsportal.ccs.miami.edu/SmallMolecules/view/' + n[2] + '">' + n[2] + "</a>" : "chembl" === t ? 1 === n.length ? '<a target="_blank" href="https://www.ebi.ac.uk/chembldb/index.php/compound/inspect/' + n + '">' + n + "</a>" : (n[0], n[0], '<a target="_blank" href="https://www.ebi.ac.uk/chembldb/index.php/compound/inspect/' + n[1] + '">' + n[1] + "</a>") : "kegg" === t ? 1 === n.length ? '<a target="_blank" href="http://www.genome.jp/dbget-bin/www_bget?cpd:' + n + '">' + n + "</a>" : 2 === n.length ? '<a target="_blank" href="http://www.genome.jp/dbget-bin/www_bget?cpd:' + n[0] + '">' + n[0] + '</a>, <a target="_blank" href="http://www.genome.jp/dbget-bin/www_bget?cpd:' + n[1] + '">' + n[1] + "</a>" : '<a target="_blank" href="hhttp://www.genome.jp/dbget-bin/www_bget?cpd:' + n[0] + '">' + n[0] + '</a>, <a target="_blank" href="http://www.genome.jp/dbget-bin/www_bget?cpd:' + n[1] + '">' + n[1] + '</a>, <a target="_blank" href="http://www.genome.jp/dbget-bin/www_bget?cpd:' + n[2] + '">' + n[2] + "</a>" : "pubchem" === t ? '<a target="_blank" href="https://pubchem.ncbi.nlm.nih.gov/compound/' + n + '">' + n + "</a>" : void 0
}

function activateNode(e) {
renderer.dispatchEvent("outNode", {
    node: sg.graph.nodes(e)
}), renderer.dispatchEvent("clickNode", {
    node: sg.graph.nodes(e)
})
}

function hoverNode(e) {
renderer.dispatchEvent("overNode", {
    node: sg.graph.nodes(e)
})
}

function deactivateNode(e) {
renderer.dispatchEvent("outNode", {
    node: sg.graph.nodes(e)
})
}
sigma.classes.graph.addMethod("neighbors", function(e) {
var t, n = {},
    a = this.allNeighborsIndex[e] || {};
for (t in a) n[t] = this.nodesIndex[t];
return n
}), sigma.parsers.gexf(fname, {
container: "graph-container",
renderer: {
    container: document.getElementById("graph-container"),
    type: sigma.renderers.canvas
},
settings: {
    defaultEdgeType: "curve"
}
}, function(a) {
function e(e) {
    var t = e.target.value;
    _.$("min-degree-val").textContent = t, filter.undo("min-degree").nodesBy(function(e) {
        return this.degree(e.id) >= t
    }, "min-degree").apply()
}
$(function() {
    var e = window.location.hash.substr(1);
    0 < e.length && a.renderers[0].dispatchEvent("clickNode", {
        node: a.graph.nodes(e)
    }), $("#search").on("keydown", function(e) {
        if ($("#attributepane").hide(), $(".invalid-feedback").hide("slow"), 13 == e.keyCode) {
            var t = $(this).val(),
                n = 0;
            a.graph.nodes().forEach(function(e) {
                e.id === t.trim() && (n = 1)
            }), 7 === t.length && 1 == n ? a.renderers[0].dispatchEvent("clickNode", {
                node: a.graph.nodes(t)
            }) : $(".invalid-feedback").show("slow")
        }
    })
}), renderer = a.renderers[0], sg = a, $(".node-count").html(a.graph.nodes().length), $(".edge-count").html(a.graph.edges().length), a.graph.nodes().forEach(function(e) {
    e.originalColor = e.color
}), a.graph.edges().forEach(function(e) {
    e.originalColor = e.color
}), a.bind("clickNode", function(e) {
    setTimeout(function() {
        $("#attributepane").show(), $(".return-button").click(function() {
            $("#attributepane").hide(), window.location.hash = "", a.graph.nodes().forEach(function(e) {
                e.color = e.originalColor
            }), a.graph.edges().forEach(function(e) {
                e.color = e.originalColor
            }), a.refresh()
        }), $(".node-name").html('<a href="#' + e.data.node.id + "\" onmouseover=\"renderer.dispatchEvent('overNode', {node:sg.graph.nodes('" + e.data.node.id + "')})\" onmouseout=\"renderer.dispatchEvent('outNode', {node:sg.graph.nodes('" + e.data.node.id + "')})\">" + e.data.node.attributes.name + "</a>"), $(".node-atc").html(atc[e.data.node.attributes.atc_codes_letter]), $(".node-code").html(generateLinks(e.data.node.attributes.atc_codes, "atc")), $(".node-type").html(e.data.node.attributes.type), $(".node-group").html(generateLinks(e.data.node.attributes.groups, "group")), $(".node-cat").html(generateLinks(e.data.node.attributes.categories, "cat")), $(".node-db").html('<a target="_blank" href="https://www.drugbank.ca/drugs/' + e.data.node.id + '">' + e.data.node.id + "</a>"), $(".node-lincs").html(generateLinks(e.data.node.attributes.lincs_id, "lincs")), $(".node-pubchem").html(generateLinks(e.data.node.attributes.pubchem_cid, "pubchem")), $(".node-chembl").html(generateLinks(e.data.node.attributes.chembl_id, "chembl")), $(".node-kegg").html(generateLinks(e.data.node.attributes.kegg_id, "kegg")), $(".structure").html('<img src="https://www.drugbank.ca/structures/' + e.data.node.id + '/image.svg" alt="Drug structure" width="80px" height="80px" class="img-thumbnail rounded mx-auto d-block mb-2">');
        var i = e.data.node.id,
            d = a.graph.neighbors(i);
        d[i] = e.data.node, $table = $(".node-edges > tbody:last"), $table.empty(), a.graph.nodes().forEach(function(e) {
            if (d[e.id]) {
                e.color = e.originalColor;
                var t = (a = e.id, o = i, sg.graph.edges().forEach(function(e) {
                        e.source === a && e.target === o && (r = e.weight), void 0 === r && e.source === o && e.target === a && (r = e.weight)
                    }), r),
                    n = "-";.5 <= t && (n = "strong"), null != t && $table.last().append('<tr><td><a href="#' + e.id + '" onclick="activateNode(\'' + e.id + "')\" onmouseover=\"hoverNode('" + e.id + "')\" onmouseout=\"deactivateNode('" + e.id + "')\">" + e.label + '</a></td><td class="text-center">' + t.toFixed(3) + "</td><td>" + n + "</td></tr>")
            } else e.color = "#eee";
            var a, o, r
        }), a.graph.edges().forEach(function(e) {
            d[e.source] && d[e.target] ? e.color = e.originalColor : e.color = "#eee"
        }), a.refresh(), a.active = e, window.location.hash = e.data.node.label
    }, 200)
}), $("#zoom").find("div.zoom-icons").each(function() {
    var e = $(this),
        t = e.attr("rel");
    e.click(function() {
        var e = a.camera;
        "center" == t ? a.cameras[0].goTo({
            x: 0,
            y: 0,
            angle: 0,
            ratio: 1
        }) : "out" == t ? e.goTo({
            ratio: e.ratio * e.settings("zoomingRatio")
        }) : e.goTo({
            ratio: e.ratio / e.settings("zoomingRatio")
        })
    })
}), document.getElementById("export-btn").onclick = function() {
    swal({
        title: "Export SVG image",
        text: "You want to export this network?",
        icon: "info",
        buttons: [!0, "Yes"]
    }).then(function(e) {
        if (e) a.toSVG({
            download: !0,
            filename: "dan-network.svg",
            size: 1e3
        })
    })
}, filter = new sigma.plugins.filter(a), updatePane(a.graph, filter), _.$("min-degree").addEventListener("input", e), _.$("min-degree").addEventListener("change", e), _.$("node-category").addEventListener("change", function(e) {
    var t = e.target[e.target.selectedIndex].value;
    filter.undo("node-category").nodesBy(function(e) {
        return !t.length || e.attributes.atc_codes_letter === t
    }, "node-category").apply()
})
}), $(window).on("load", function() {
setTimeout(function() {
    $(".se-pre-con").hide("slow")
}, 500)
}), $("img").each(function() {
$(this).attr("src", $(this).attr("delayedsrc"))
});