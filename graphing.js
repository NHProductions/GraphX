

class graphNode {
    constructor(value,x,y,n) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.name = n;
        this.id = n;
        this.color = "rgb(255,0,0)";
        this.annotation = "";
    }
    isValid() {
        return (typeof this.x == "Number" && typeof this.y == "Number"
            && typeof this.name == "String" && typeof this.id == "String" &&
            typeof this.color == "String" && typeof this.annotation == "String"
        );
    }
}
class edge {
    constructor(A, B) {
        this.A = A;
        this.B = B;
    }
    isValid() {
        return this.A.constructor.name == "graphNode" && this.B.constructor.name == "graphNode";
    }
}
class graph {
    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
    }
    removeNode(idx) {
        var toRemove = this.nodes[idx];
        
        this.edges = this.edges.filter((node, i) => {
            return node.A != toRemove && node.B != toRemove;
        });
        this.nodes.splice(idx, 1);
    }
    removeEdge(idx) {
        this.edges.splice(idx, 1);
    }
    isEdgeBi(idx) {
        return this.edges.filter((e, i) => {
            if (i == idx) return true;
            if (e.A == this.edges[idx].B && e.B == this.edges[idx].A) return true;
            if (e.B == this.edges[idx].A && e.A == this.edges[idx].B) return true;
            return false;
        }).length == 2;
    }
    isDirected() {
        if (this.edges.length == 0) return false;
        return this.edges.filter((e, i) => {
            return this.isEdgeBi(i);
        }).length != this.edges.length;
    }
    getEdgeCount() {
        if (!this.isDirected()) {
            return this.edges.length/2;
        }
        return this.edges.length;
    }
    getEdges(v) {
        return this.edges.filter((e,i) => {
            if (e.A == v) return true;
            return false;
        });
    }
    isEdgeParallel(idx) {
        var edge = this.edges[idx];
        var toReturn = false;
        this.edges.forEach((e,i) => {
            if (e.A == edge.A && e.B == edge.B && i != idx) toReturn = true;
        })
        return toReturn;
    }
    // simple, multigraph, pseudograph
    getGraphType() {
        // simple: Nondirected, no self loops, & no parallel edges
        var isDirected = this.isDirected();
        var isSelfLoop = false;
        var hasParallelEdges = false;
        this.edges.forEach((e,i) => {
            if (e.A == e.B) isSelfLoop = true;
            if (this.isEdgeParallel(i)) hasParallelEdges = true;
        });
        if (!isDirected && !isSelfLoop && !hasParallelEdges) return "Simple";
        if (!isSelfLoop && hasParallelEdges) return "Multigraph";
        return "Pseudograph";
    }
    nodeHasSelfLoop(node) {
        return this.edges.filter((e) => {
            return (e.A == node && e.B == node) 
        }).length >= 1;
    }
    getRecipNeighbors(node) {
        var toRet = new Set([]);
        this.getEdges(node).forEach((e) => {
            var edges = this.getEdges(e.B);
            for (var edge of edges) {
                if (edge.B == node) toRet.add(edge.A);
            }
        });
        return Array.from(toRet);
    }
    containsSelfLoop() {
        return this.nodes.filter((e) => {
            return this.nodeHasSelfLoop(e);
        }).length > 0;
    }
    getVertexInDegree(idx) {
        var n = this.nodes[idx];
        return this.edges.filter((e,i) => {
            if (e.B == n) return true;
            return false;
        }).length;
    }
    getVertexOutDegree(idx) {
        var n = this.nodes[idx];
        return this.edges.filter((e,i) => {
            if (e.A == n) return true;
            return false;
        }).length;
    }
    getDegree(idx) {
        return this.getVertexInDegree(idx) + this.getVertexOutDegree(idx);
    }
    getIdx(node) {
        for (var j in this.nodes) {
            if (this.nodes[j] == node) return j;
        }
        return -1;
    }
    isNodeIsolated(node) {
        if (this.getDegree(this.getIdx(node)) == 0) return true;
        return false;
    }
    isNodeArticulationPt(node, isDirected) {
        if (this.isConnected() == "No") return false;
        var testGraph = new graph(this.nodes.filter((e) => {
            return e != node;
        }), this.edges.filter((e) => {
            return e.A != node && e.B != node;
        }));
        if (testGraph.isConnected() == "No") {
            return true;
        }
        return false;
    }
    getIsolatedNodes() {
        return this.nodes.filter((e,i) => {
            return this.isNodeIsolated(e);
        });
    }
    getAverageDegree(isinDeg) {
        var sum = 0;
        var toDiv = 0;
        this.nodes.forEach((e,i) => {
            if (isinDeg == 0) {
                sum += this.getDegree(i);
                toDiv++;
            }
            if (isinDeg == 1) {
                sum += this.getVertexInDegree(i);
                toDiv++;
            }
            if (isinDeg == 2) {
                sum += this.getVertexOutDegree(i);
                toDiv++;
            }
        });
        if (toDiv == 0) return 0;
        return sum/toDiv;
    }
    getAAD(d) {
        var sum = 0;
        var ct = 0;
        var avg = this.getAverageDegree(d);
        this.nodes.forEach((e,i) => {
            if (d == 0) {
                var deviation = avg-this.getDegree(i);
                sum += Math.abs(deviation);
                ct++;
            }
            if (d == 1) {
                var deviation = avg-this.getVertexInDegree(i);
                sum += Math.abs(deviation);
                ct++;
            }
            if (d == 2) {
                var deviation = avg-this.getVertexOutDegree(i);
                sum += Math.abs(deviation);
                ct++;
            }
        });
        if (ct == 0) return 0;
        return sum/ct;
    }
    getDirectedComponents() {
        var components = [];
        var visited = new Set();
        for (const v of this.nodes) {
            const startNode = v;
            if (!visited.has(startNode)) {
                var currentcomp = [];
                const q = [startNode];
                visited.add(startNode);

                while (q.length > 0) {
                    const node = q.shift();
                    currentcomp.push(node);
                    for (const neighbor of this.getBiNeighbors(node)) {
                        if (!visited.has(neighbor)) {
                            visited.add(neighbor);
                            q.push(neighbor);
                        }
                    }
                }
                components.push(currentcomp);
            }
        }
        return components;
    }
    findDegSpec(isDirected, isMax) {
        var mult = isMax ? -1 : 1;
        var specNode = this.getIdx(this.nodes.toSorted((a,b) => {
            let idxA = this.getIdx(a);
            let idxB = this.getIdx(b);
            if (isDirected == 0) {
                return mult*(this.getDegree(idxA) - this.getDegree(idxB));
            } 
            if (isDirected == 1) {
                return mult*(this.getVertexInDegree(idxA) - this.getVertexInDegree(idxB));
            }
            if (isDirected == 2) {
                return mult*(this.getVertexOutDegree(idxA) - this.getVertexOutDegree(idxB));
            }
        })[0]);
        if (isDirected == 0) return this.getDegree(specNode);
        if (isDirected == 1) return this.getVertexInDegree(specNode);
        if (isDirected == 2) return this.getVertexOutDegree(specNode);
    }
    getDensity(isDirected) {
        if (this.nodes.length <= 1) return 0;
        if (!isDirected) {
            return (this.edges.length)/(this.nodes.length*(this.nodes.length-1));
        }
        return this.edges.length/(this.nodes.length*(this.nodes.length-1));
    }
    isComplete(isDirected) {
        if (this.nodes.length == 0) return false;
        if (this.nodes.length == 1 && this.edges.length == 0) return true;
        for (var i of this.nodes) {
            var edges = this.getEdges(i);
            for (var n of this.nodes) {
                if (n == i) continue;
                var contains = false;
                for (var edge of edges) {
                    if (edge.B == n) {
                        contains = true;
                        break;
                    }
                }
                if (!contains) {
                    return false;
                }
            }
        }
        return true;
    }
    getNeighbors(node) {
        var toRet = [];
        this.getEdges(node).forEach(e => {
            toRet.push(e.B);
        })
        return toRet;
    }
    getSuccessors(node) {
        var toRet = new Set([]);
        this.edges.forEach((e) => {
            if (e.B == node) toRet.add(e.A);
        });
        return Array.from(toRet);
    }
    getPredecessors(node) {
        var toRet = new Set([]);
        this.edges.forEach((e) => {
            if (e.A == node) toRet.add(e.B);
        });
        return Array.from(toRet);
    }
    getBiNeighbors(node) {
        var toRet = new Set([]);
        this.edges.forEach((e) => {
            if ((e.A == node || e.B == node)) {
                toRet.add(e.A == node ? e.B : e.A);
            }
        })
        return Array.from(toRet);
    }
    isConnected(isDirected) {
        if (this.nodes.length <= 1) {
            return isDirected ? "Strongly Connected" : "Yes";
        }

        // Check reachability using either directed or undirected edges.
        const canReachAll = (start, mode) => {
            const visited = new Set([start]);
            const queue = [start];

            while (queue.length > 0) {
                const current = queue.shift();

                for (const e of this.edges) {
                    let neighbor = null;

                    if (mode === "undirected") {
                        if (e.A === current) neighbor = e.B;
                        else if (e.B === current) neighbor = e.A;
                    } else if (mode === "forward") {
                        if (e.A === current) neighbor = e.B;
                    } else if (mode === "reverse") {
                        if (e.B === current) neighbor = e.A;
                    }

                    if (neighbor !== null && !visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            }

            return visited.size === this.nodes.length;
        };

        const start = this.nodes[0];

        if (!isDirected) {
            return canReachAll(start, "undirected") ? "Yes" : "No";
        }

        if (
            canReachAll(start, "forward") &&
            canReachAll(start, "reverse")
        ) {
            return "Strongly Connected";
        }

        return canReachAll(start, "undirected")
            ? "Weakly Connected"
            : "No";
    }
    isCycleGraph(isDirected) {
        if (isDirected) return false;
        if ((this.isConnected(isDirected) != "No" && this.nodes.length >= 3 && this.nodes.filter((e,i) => {
            return this.getNeighbors(e).length == 2;
        })).length == this.nodes.length) return true;
        return false;
    }
    isWheelGraph(isDirected) {
        if (this.nodes.length < 4) return false;
        if (isDirected) return false;
        var vDeg = this.nodes.length-1;
        var foundAllowed = false;
        if ((this.isConnected(isDirected) != "No" && this.nodes.length >= 3 && this.nodes.filter((e,i) => {
            var neighborNum = this.getNeighbors(e).length;
            var retVal = neighborNum == 3 || (!foundAllowed && neighborNum == vDeg);
            if (neighborNum == vDeg) foundAllowed = true;
            return retVal;
        })).length == this.nodes.length) return true;
        return false;
    }
    isPath(isDirected) {
        if (this.nodes.length == 0) return false;
        if (isDirected) return false;
        if (this.nodes.length == 1) return true;
        
        var deg1Vertices = 0;
        var deg2Vertices = 0;
        var isConnected = this.isConnected(isDirected);
        isConnected = isConnected != "No" ? true : false;

        if (!isConnected) return false;
        for (var i of this.nodes) {
            var neighbors = this.getBiNeighbors(i);
            if (neighbors.length == 0) return false;
            if (neighbors.length == 1) deg1Vertices++;
            else if (neighbors.length == 2) deg2Vertices++;
            else return false;
        }
        if (deg1Vertices == 2 && deg2Vertices == this.nodes.length-2) return true;
        return false;
    }
    isBipartite() {
        const colors = new Map();
        const setA = [];
        const setB = [];

        for (const node of this.nodes) {
            if (colors.has(node)) continue;
            const q = [node];
            colors.set(node, 0);
            while (q.length > 0) {
                const current = q.shift();
                const currentColor = colors.get(current);

                for (const neighbor of this.getBiNeighbors(current)) {
                    if (!colors.has(neighbor)) {
                        colors.set(neighbor, 1 - currentColor);
                        q.push(neighbor);
                    }
                    else if (colors.get(neighbor) === currentColor) {
                        return null;
                    }
                }
            }
        }

        for (const [node, color] of colors.entries()) {
            if (color === 0) {
                setA.push(node);
            }
            else setB.push(node);
        }
        return [setA, setB];
    }
    isCompleteBipartite(biSet) {
        if (biSet == null) return false;
        let m = biSet[0].length;
        let n = biSet[1].length;
        for (var node of biSet[0]) {
            if (this.getNeighbors(node).length != n) return false;
        }
        for (var node of biSet[1]) {
            if (this.getNeighbors(node).length != m) return false;
        }
        return true;
    }
    isDirectedAcyclic() {
        const visited = new Set();
        const recStack = new Set();
        var hasCycle = (node => {
            visited.add(node);
            recStack.add(node);
            for (let neighbor of this.getNeighbors(node)) {
                 if (!visited.has(neighbor)) {
                    if (hasCycle(neighbor)) return true;
                 }
                 else if (recStack.has(neighbor)) {
                    return true;
                 }
            }
            recStack.delete(node);
            return false;
        });
        for (let node of this.nodes) {
            if (!visited.has(node)) {
                if (hasCycle(node)) return false;
            }
        }
        return true;
    }
    isUndirectedAcyclic() {
        const visited = new Set();
        var hasCycle = (node, parent) => {
            visited.add(node);
            for (let neighbor of this.getNeighbors(node)) {
                if (!visited.has(neighbor)) {
                    if (hasCycle(neighbor, node)) return true;
                } else if (neighbor !== parent) return true;
            }
            return false;
        }
        for (let node of this.nodes) {
            if (!visited.has(node)) {
                if (hasCycle(node, null)) return false;
            }
        }
        return true;
    }
    isAcyclic(isDirected) {
        if (!isDirected) return this.isUndirectedAcyclic();
        return this.isDirectedAcyclic();
    }
    isTree(isDirected = false) {
        if (isDirected) return 0;

        if (this.nodes.length === 0) return 0;

        if (this.isConnected(false) === "No") {
            return this.isAcyclic(false) ? 2 : 0; // Forest
        }

        return this.isAcyclic(false) ? 1 : 0; // Tree
    }
    nodeFromID(id) {
        for (var i in this.nodes) {
            if (this.nodes[i].id == id) return i;
        }
        return null;
    }
    getGraphSpecialTypes(isDirected) {
        var types = "";
        var isConnected = this.isConnected(isDirected);
        if (this.isComplete(isDirected)) types += ` K<sub>${this.nodes.length}</sub>`;
        if (this.isCycleGraph(isDirected)) types += ` C<sub>${this.nodes.length}</sub>`;
        if (this.isPath(isDirected)) types += ` P<sub>${this.nodes.length}</sub>`;
        var isBipartite = this.isBipartite();
        if (this.isCompleteBipartite(isBipartite)) {
            types += ` K<sub>${isBipartite[0].length},${isBipartite[1].length}</sub>`;
        }
        if (this.isWheelGraph(isDirected)) types += ` W<sub>${this.nodes.length}</sub>`;
        return types;
    }
    copy() {
        var toReturn = new graph([], []);
        this.nodes.forEach((e) => {
            var toApp = new graphNode(0, e.x, e.y, e.name);
            toApp.color = e.color;
            toApp.id = e.id;
            toReturn.nodes.push(toApp);
        });
        this.edges.forEach((e) => {
            var toApp = new edge(null, null);
            toApp.A = toReturn.nodes[this.nodes.indexOf(e.A)];
            toApp.B = toReturn.nodes[this.nodes.indexOf(e.B)];
            toReturn.edges.push(toApp);
        });
        return toReturn;
    }
}
function deserializeNode(n) {
    const node = new graphNode(0, n.x, n.y, n.name);
    node.id = n.id;
    node.color = n.color;
    node.annotation = n.annotation;
    return node;
}
function cmpNodes(a,b) {
    return a.id == b.id;
}
function deserializeGraph(data) {
    if (data == null) return null;
    if (!Array.isArray(data.nodes)) return null;
    if (!Array.isArray(data.edges)) return null;

    const nodes = data.nodes.map(n => {
        return deserializeNode(n);
    });

    const edges = data.edges.map(n => {
        var e = new edge(deserializeNode(n.A), deserializeNode(n.B));
        e.A = nodes.filter((ed) => {
            return cmpNodes(e.A, ed);
        })[0];
        e.B = nodes.filter((ed) => {
            return cmpNodes(e.B, ed);
        })[0];
        return e;
    })
    
    return new graph(nodes, edges);

}

var globalGraph = new graph([], []);
var currentNameIdx = 1;