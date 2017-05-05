function Vector(x, y, z) {
    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.z = z ? z : 0;
    this.add = function(other, mult) {
        if (mult === undefined) { mult = 1; }
        return new Vector(this.x + other.x * mult, this.y + other.y * mult, this.z + other.z * mult);
    }
    this.subtract = function(other, mult) {
        if (mult === undefined) { mult = 1; }
        return new Vector(this.x - other.x * mult, this.y - other.y * mult, this.z - other.z * mult);
    }
    this.magnitude = function() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
    }
    this.dist = function(other) {
        return this.subtract(other).magnitude();
    }
    this.dot = function(other) {
        return (this.x * other.x) + (this.y * other.y) + (this.z * other.z);
    }
    this.normalize = function() {
        var mag = this.magnitude();
        if (mag === 0) { mag = Infinity; }
        return new Vector(this.x/mag, this.y/mag, this.z/mag);
    }
    this.mult = function(factor) {
        return new Vector(this.x * factor, this.y * factor, this.z * factor);
    }
    this.get = function() {
        return new Vector(this.x, this.y, this.z);
    }
    this.round = function() {
        var round = x => Math.round(x * 100) / 100;
        return new Vector(round(this.x), round(this.y), round(this.z));
    }
    this.project = function(other) {
        //Project ONTO other
        return other.mult(this.dot(other) / other.dot(other));
    }
}

function random(a, b, integers) {
    if (integers) {
        b = b + 1;
        return Math.floor(b - (b - a) * Math.random())

    } else {
        return b - (b - a) * Math.random();
    }
}

var fpsCounter = document.getElementById('fpscounter');
var fps = {
    startTime: 0,
    frameNumber: 0,
    getFPS: function() {
        this.frameNumber++;
        var d = new Date().getTime(),
        currentTime = (d - this.startTime) / 1000,
        result = Math.floor(this.frameNumber / currentTime);
        if (currentTime > 1) {
            this.startTime = new Date().getTime();
            this.frameNumber = 0;
        }
        return result;
    }
};

var canvas = document.getElementById('canvas');
var nodeRadius = 20;
var tmpCirc = document.getElementById('tmpCirc');
tmpCirc.setAttribute('r', nodeRadius);

var isMouseDown = false;
var mousePos = new Vector();

var targetFrameRate = 60;
var animation;
var xoffset = 200;
var width = window.innerWidth - xoffset;
var height = window.innerHeight;
var screenCenter = new Vector(width/2, height/2);
var currColor = '#FFFFFF';
var nodes = []; // An array of every node in the system
var edges = []; // An array of edge svg elements

function clearEdges() {
    for (var i = 0; i < edges.length; i++) {
        canvas.removeChild(edges[i]);
    }
    edges = [];
}

function clearNodes() {
    for (var i = 0; i < nodes.length; i++) {
        canvas.removeChild(nodes[i].htmlObj);
    }
    nodes = [];
}

function drawEdge(u, v, col, strokeWidth) {
    if (col === undefined)
        col = "#FFFFFF";
    if (strokeWidth === undefined)
        strokeWidth = 2;

    var newTag = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    newTag.setAttribute('x1', u.x);
    newTag.setAttribute('y1', u.y);
    newTag.setAttribute('x2', v.x);
    newTag.setAttribute('y2', v.y);
    newTag.setAttribute('stroke', col);
    newTag.setAttribute('stroke-width', strokeWidth);
    edges.push(newTag);
    canvas.prepend(newTag);
}

function drawGraph(G, stroke, strokeWidth) {
    for (var i = 0; i < G.length; i++) {
        G[i].drawEdges(stroke, strokeWidth);
    }
}
var Node = function(px, py, htmlObj) {
    this.position = new Vector(px, py);
    this.adjacent = [];
    this.htmlObj = htmlObj;
    this.drawEdges = function(stroke, strokeWidth) {
        for (var i= 0; i < this.adjacent.length; i++) {
            if (this !== this.adjacent[i]) {
                drawEdge(this.position, this.adjacent[i].position, stroke, strokeWidth);
            }
        }
    }
};

function isValidPos(v) {
    for (var i = 0; i < nodes.length; i++) {
        if (v.dist(nodes[i].position) < nodeRadius * 2.5)
            return false;
    }
    return true;
}

var createNode = function(pos, color) {
    if (!isValidPos(pos))
        return null;

    if (color == null) {
        color = '#' + (random(0.3, 0.8) * 0xFFFFFF << 0).toString(16);
    }
    var newTag = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    var style = `cx:${pos.x}; cy:${pos.y}; r:${nodeRadius}; fill:${color}`;
    newTag.setAttribute('style', style);
    canvas.appendChild(newTag);
    var node = new Node(pos.x, pos.y, newTag);
    node.adjacent = nodes;
    nodes.push(node);
    clearEdges();
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].drawEdges();
    }
    return node;
};

window.addEventListener('resize', function() {
    width = window.innerWidth - 200;
    height = window.innerHeight;
    screenCenter = new Vector(width/2, height/2);
});

canvas.addEventListener('mousedown', function(event) {
    if (event.which === 1) {
        isMouseDown = true;
        currColor = '#' + (random(0.3, 0.8) * 0xFFFFFF << 0).toString(16);
        tmpCirc.style.fill = currColor;
        if (isValidPos(new Vector(event.pageX - xoffset, event.pageY))) {
            tmpCirc.style.display = 'block';
        }
        tmpCirc.setAttribute('cx', event.pageX - xoffset);
        tmpCirc.setAttribute('cy', event.pageY);
    }
});

canvas.addEventListener('mouseup', function(event) {
    if (event.which === 1) {
        var v = new Vector(event.pageX - xoffset, event.pageY);
        isMouseDown = false;
        tmpCirc.style.display = 'none';
        createNode(v, currColor);
    }

    else if (event.which === 3) {
        var v = new Vector(event.pageX - xoffset, event.pageY);
        for (var i = 0; i < nodes.length; i++) {
            if (v.dist(nodes[i].position) < nodeRadius) {
                canvas.removeChild(nodes[i].htmlObj);
                nodes.splice(i, 1);
                break;
            }
        }
    }
});

canvas.addEventListener('mouseleave', function(event) {
   isMouseDown = false;
   tmpCirc.style.display = 'none';
});

canvas.addEventListener('mousemove', function(event) {
    if (isMouseDown) {
        var v = new Vector(event.pageX - xoffset, event.pageY);
        if (isValidPos(v)) {
            tmpCirc.style.display = 'block';
            tmpCirc.setAttribute('cx', v.x);
            tmpCirc.setAttribute('cy', v.y);
        } else {
            tmpCirc.style.display = 'none';
        }
    }
});

function reset() {
    clearNodes();
    clearEdges();
}

function cloud(cx, cy, num) {
    for (var i = 0; i < num; i++) {
        var x = random(cx - width/2 + 100, cx + width/2 - 100);
        var y = random(cy - height/2 + 100, cy + height/2 - 100)
        createNode(new Vector(x, y));
    }
}

document.getElementById('reset').addEventListener('click', reset);

document.getElementById('random').addEventListener('click', function() {
    reset();
    var num = document.getElementById('node-count').value;
    cloud(screenCenter.x, screenCenter.y, num);
});

document.getElementById('permutations').addEventListener('click', permutationSolution);

document.getElementById('mstapprox').addEventListener('click', mstApprox);

document.getElementById('aco').addEventListener('click', aco);

function factorial(n) {
    if (n <= 0) return 1;
    return n * factorial(n - 1);
}

function permute(permutation) {
  var length = permutation.length;
  if (length >= 11) {
    throw "It would take way too long to find a solution for " + (length + 1) + " nodes. Not attemping to do so.";
  }
  var result = new Array(factorial(length)),
      c = new Array(length).fill(0),
      i = 1,
      j = 1;

  result[0] = permutation.slice();
  while (i < length) {
    if (c[i] < i) {
      var k = (i % 2) ? c[i] : 0,
          p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      c[i]++;
      i = 1;
      result[j] = permutation.slice();
      j++;
    } else {
      c[i] = 0;
      i++;
    }
  }
  return result;
}

function solutionWeight(ordering) {
    var weight = 0;
    for (var i = 1; i < ordering.length; i++) {
        weight += ordering[i - 1].position.dist(ordering[i].position);
    }
    return weight;
}

function permutationSolution() {
    var start = new Date().getTime();
    var permutations = permute(nodes.slice(1));
    var minWeight = Infinity;
    var minOrdering;
    for (var i = 0; i < permutations.length; i++) {
        var ordering = [nodes[0], ...permutations[i], nodes[0]];
        var weight = solutionWeight(ordering);
        if (weight < minWeight) {
            minWeight = weight;
            minOrdering = ordering;
        }
    }

    clearEdges();

    for (var i = 1; i < minOrdering.length; i++) {
        drawEdge(minOrdering[i - 1].position, minOrdering[i].position);
    }
    var t = (new Date().getTime() - start) / 1000.0;
    console.log("Permutations: " + t + " seconds for " + nodes.length + " nodes");
}

function toIndex(x) {
    return nodes.indexOf(x);
}

function toIndices(a) {
    var x = [];
    for (var i = 0; i < a.length; i++) {
        x.push(nodes.indexOf(a[i]));
    }
    return x;
}
function print(a) {
    for (var i = 0; i < a.length; i++) {
        console.log(a[i]);
    }
}

function drawEdgeSubset(e) {
    clearEdges();
    for (var i = 0; i < e.length; i++) {
        drawEdge(e[i][0].position, e[i][1].position);
    }
}
function primMst(V) {
    var n = V.length;
    var distFromTree = new Array(n).fill([0, Infinity]);
    var marked = new Array(n).fill(false);
    var tree = [];
    for (var i = 0; i < n; i++) {
        var pos = V[i].position;
        tree.push(new Node(pos.x, pos.y, V[i].htmlObj));
    }
    var curr = 0;
    for (var i = 0; i < n; i++) {
        var minIdx = 0;
        var minDist = [0, Infinity];
        for (var j = 0; j < n; j++) {
            if (marked[j]) continue;
            var distFromCurr = V[curr].position.dist(V[j].position);
            if (distFromCurr < distFromTree[j][1]) {
                distFromTree[j] = [curr, distFromCurr];
            }
            if (distFromTree[j][1] < minDist[1]) {
                minDist = distFromTree[j];
                minIdx = j;
            }
        }
        if (i > 0) {
            tree[minIdx].adjacent.push(tree[minDist[0]]);
            tree[minDist[0]].adjacent.push(tree[minIdx]);
        }
        marked[minIdx] = true;
        curr = minIdx;
    }
    clearEdges();
    return tree;
}

function DFS(node, pre, post) {
    var marked = new Set();
    function dfsRec(node, pre, post) {
        for (var i = 0; i < node.adjacent.length; i++) {
            var v = node.adjacent[i];
            if (!marked.has(v)) {
                marked.add(v);
                pre(v);
                dfsRec(v, pre, post);
                post(v);
            }
        }
    }
    dfsRec(node, pre, post);
}

function mstApprox() {
    var mst = primMst(nodes);
    var preorder = [];
    DFS(mst[0], x => preorder.push(x), () => {});
    preorder.push(preorder[0]);
    drawGraph(mst, '#FF00FF', 1);
    for (var i = 1; i < preorder.length; i++) {
        drawEdge(preorder[i - 1].position, preorder[i].position, "#00FF00", 6);
    }
}

function aco() {
    console.log('ACO: not yet implemented.');
}
