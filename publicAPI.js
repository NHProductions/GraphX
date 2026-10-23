var publicAPI = `
class graphNode {
    constructor(value,x,y,n) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.name = n;
        this.id = n;
        this.color = "rgb(255,0,0)";
    }
}
class edge {
    constructor(A, B) {
        this.A = A;
        this.B = B;
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
    getVertexInDegree(node) {
        return this.edges.filter((e,i) => {
            if (e.B == node) return true;
            return false;
        }).length;
    }
    getVertexOutDegree(node) {
        return this.edges.filter((e,i) => {
            if (e.A == node) return true;
            return false;
        }).length;
    }
    getDegree(node) {
        return this.getVertexInDegree(node) + this.getVertexOutDegree(node);
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
    getNeighbors(node) {
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
`