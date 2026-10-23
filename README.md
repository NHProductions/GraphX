# GraphX - Interactive Graph Theory Editor
  GraphX is a highly intuitive browser-based graph editor for visualizing & analyzing graphs. It provides an interactive canvas for manipulating vertices & edges, statistics about the graphs, node editing, JSON import/export, and a javascript API that users can use directly from the browser.
  GraphX supports directed and undirected graphs, checking properties regarding graphs, and the ability for users to write functions that operate directly onto the graph.

## Table of Contents
[Features](https://github.com/NHProductions/GraphX#Features)

[Getting Started](https://github.com/NHProductions/GraphX#Getting-Started)

[Interface & Controls](https://github.com/NHProductions/GraphX#interface--controls)

[Graph Model](https://github.com/NHProductions/GraphX#importing--exporting-graphs)

[Importing/Exporting](https://github.com/NHProductions/GraphX#importing--exporting-graphs)

[GraphXAPI](https://github.com/NHProductions/GraphX#GraphXAPI)

[Implementation Notes & Limitations](https://github.com/NHProductions/GraphX#importing--exporting-graphs)

## Features
- Graph Canvas: Similar to Desmos, with the ability to create vertices, drag them, and pan around the canvas.
- Graph Editing: Create, delete, rename vertices, and change their color/position.
- Node Properties: View degree info, neighbors, predecessors, successors, components, & more.
- Graph statistics: View graph order, size, directedness, density, degree stats, connectivity, and graph family.
- Import/Export: Ability to import and export graphs using JSON.
- GraphXAPI: Execute user-written javascript to transform graphs and obtain more info about graphs and the nodes in them.
## Getting Started
### Requirements
GraphX runs in any modern browser that supports SVG, Web Workers, & the Blob API.
### Running the editor
Download the files in the repo, putting them all in the same directory. Then, run index.html.
## Interface & Controls
The toolbar is on the bottom left corner of the canvas. Select a tool and interact with the graph to perform an operation:
| Control | Function |
| :--- | :--- |
| + | Create a vertex by clicking on the canvas.
| X | Delete a vertex or edge by clicking on it.
| / | Create a bidirectional edge between two vertices.
| ↗ | Create a directed edge between two vertices
| ? | Open graph information & select vertices to edit.
| (0,0) | Reset canvas position.
| </> | Open the algorithm editor.
| { } | Open the graph import/export panel.
### Creating & Moving Vertices
Select +, click an empty location on the canvas, and a new vertex appears. It is automatically assigned a numeric name. To move a vertex, simply drag it on the canvas.
### Creating Edges
Select ↗ or /, then click on the two vertices you want to connect. Directional edges have an arrowhead, whilst undirected edges do not.
### Deleting Elements
Click on X, then select the element you want to delete.
### Editing Vertices
Open the graph info panel and select a vertex. It will then display several properties regarding the vertex selected:
- Name: Vertex's display name
- ID: Unique identifier for vertices; readonly. Algorithms are allowed and encouraged to change this property.
- Color: The vertex's color. Not recommended to have it be fully black or white, as it conflicts with the background.
- Position: The vertex's cordinates in (x,y).
- Degree: Displays the total degree
- In & Out degree: Displays the in- and out- degrees of the vertex.
- Isolated: Displays whether the node is isolated or not.
- Articulation Point: Displays whether if the vertex is removed, then the graph will be disconnected.
- Self Loop: Displays if the vertex has a self loop.
- Reciprocal Neighbors: Displays all recipricol neighbors (Neighbors that also have an edge to the vertex)
- Component: Displays all members of the component its in.
- Neighbors: Displays all neighbors of the vertex.
- Successors: Displays all successor vertices.
- Predecessors: Displays all predecessor vertices.
### Graph Info Panel
The graph info panel also gives a lot of information regarding the graph:
- Order: Amount of vertices in the graph
- Size: Amount of edges in the graph
- Type: Displays the overall type of the graph: whether it's simple, multigraph, or digraph.
- Directed: Displays whether there is atleast 1 directed edge in the graph.
- Average Degree: Displays the average degree of the nodes in the graph.
- Average Absolute DegDev: Displays the average absolute degree deviation within the nodes of the graph; essentially, it tells how much deviance there is in the degree of the nodes with the average.
- Isolated Vertices: Lists the isolated vertices in the graph
- Components: Lists the amount of components in the graph
- Density: Lists the density of the graph
- Minimum & Maximum degree: Lists the min & max degree.
- Families: Lists the graph families that the graph is in; below is the families recognized:
    - K<sub>n</sub> - Complete Graphs
    - C<sub>n</sub> - Cycle Graphs
    - P<sub>n</sub> - Path Graphs
    - K<sub>n,m</sub> - Complete Bipartite Graphs
    - W<sub>n</sub> - Wheel Graphs
- Connected: Displays whether the graph is connected
- Cyclic: Displays whether there is atleast 1 cycle in the graph
- Bipartite: Displays whether the graph is bipartite
- Tree: Displays whether the graph is a tree or a forest or neither.
- DAG: Displays whether the graph is a directed acyclic graph.
## Graph Model
GraphX represents graphs using vertices and directed edge objects. The model consists of three class: graphNode, edge, and graph.
### graphNode
Represents a vertex in the graph.
| Property | Value | Type Restriction | Default Value |
| :--- | :--- | :--- | :-- |
| x | Horizontal Canvas Coordinate | Number | User-Click position Y |
| y | Vertical Canvas Coordinate | Number | User-Click position X|
| name | Display name of the vertex | String | ID of the vertex |
| id | Unique identifier of the vertex | String | Total amount of vertices created at the time of creation OR if created in an algorithm, the name of the node. |
| color | Vertex color | String in the format of "rgb(R,G,B)" where R, G, & B are numbers. | "rgb(255,0,0" |
| annotation | Text associated w/ Algorithm output | String | "" |
### edge
Represents a directed edge in the graph.
| Property | Value | Type Restriction |
| :--- | :--- | :--- |
| A | Source vertex | graphNode |
| B | Destination vertex | graphNode |
Undirected connections are added by adding both edge(A,B) and edge(B,A).
### graph
Contains the graph's vertices, edges, and has all functions regarding the graph.
| Property | Value | Type Restriction |
| :--- | :--- | :--- |
| nodes | Array of graphNode objects | graphNode[] |
| edges | array of edge objects | edge[] |
### Example
Below is an example of creating a graph
```javascript
const a = new graphNode(100,100,"A");
const b = new graphNode(100,100,"B");

const connection = new edge(a,b);

const exampleGraph = new graph([a,b], [connection]);
```
## Importing & Exporting Graphs
Open the { } toolbar panel to access the import/export interface.
The interface has 2 JSON fields:
1. Nodes: Array of vertex names
2. Edges: Maps each vertex to an array of destination vertices

Example:
Vertices:
```JSON
["A", "B", "C"]
```
Edges:
```
{
"A": ["B","C"]
"B": ["A","C"]
"C": ["A","B"]
}
```
This import creates C<sub>3</sub>. Imports automatically rearrange the vertices in a circle. The importer does not provide syntax correction or validation for malformed JSON. All graph names should be unique when importing.

Exporting is essentially the same; clicking the "export" button makes the given graph in the format. All graph names should be unique when exporting.

***Important:*** Only node names and edge relations are preserved. Colors, ids, & position are not.
## GraphXAPI

GraphX includes a javascript editor for writing custom algorithms with the graph model. Open the </> toolbar panel to access the editor.

### Execution Modes
| Mode | Description |
| :--- | :--- |
| For Each Node | Runs the algorithm once for each vertex, and displays the result |
| For the Graph | Runs the algorithm once and displays 1 result. |
| Transform | Runs the algorithm once and attempts to replace the current graph with a returned graph |

The editor provides a code input, console output, and results panel.

### main Function:
```
function main(globalGraph, node, console) {
  // your algorithm
  return /* -- Depends on the mode -- */
}
```
Arguments:
  - globalGraph: A copy of the graph supplied
  - node: Current vertex in For Each Node mode; undefined in other modes.
  - console: Console object that provides .log, .warn, and .error.
### For Each Node - Example:
Below is an example of the for each node mode. This algorithm returns whether each node's degree is divisible by three.
```Javascript
function main(globalGraph, node, console) {
  const degree = globalGraph.getDegree(node);
  console.log(`Node ${node.name} has degree ${degree}`
  return degree % 3 == 0;
}
```
The result of the algorithm is displayed next to each vertex, and in the results panel
### For The Graph - Example:
Below is an example of the For The Graph mode. This algorithm returns what % of vertices have atleast 1 vertex.
```Javascript
function main(globalGraph, node, console) {
     var amt1 = 0;
     var total = 0;
     globalGraph.nodes.forEach((e) => {
          total++;
          amt1 += (globalGraph.getDegree(e) > 1)
     });
     return amt1/total;
}
```
### Transform - Example:
Below is an example of the transform mode. This algorithm returns K<sub>20</sub>, arranged in a circle. The transform mode expects main() to return a graph object. 
```Javascript
function main(globalGraph, node) {
	var toRet = new graph([], []);
	var amt = 20;
	var radius = 500;
	var slope = 2*Math.PI/amt;
	for (var i = 0; i < amt; i++) {
		var x = Math.sin(slope*i)*radius;
		var y = Math.cos(slope*i)*radius;
    	var toPush = new graphNode(0, x, y, String(i));
    	toPush.id = String(i)+"P";
	    toPush.annotation = "";
		toPush.color = `rgb(255,0,0)`;
		for (var f of toRet.nodes) {
			var edgeA = new edge(toPush, f);
			var edgeB = new edge(f, toPush);
			toRet.edges.push(edgeA);
			toRet.edges.push(edgeB);
		}
		toRet.nodes.push(toPush);
	}
	return toRet;
}
```
### Execution Behavior:
Algorithms execute in a web worker, using a copy of the graph. During execution, console messages are collected and displayed. Javascript errors are also displayed with stack info when available. If another algorithm is started while one is running, it is terminated. Execution is stopped after 200 seconds.

Security Note: Only run trusted code. The execution environment is not a full security sandbox.

For more information on documentation, check out the wiki page associated with this repo.

## Project Structure
GraphX/
  - Index.html # User interface, styling, editor
  - Graphing.js # Graph classes & operations
  - publicAPI.js # JS embedded into the web worker
## Notes
Below are details that are important to keep in mind when using or extending GraphX:
- Directedness is inferred: A graph is only directed if there is atleast 1 directed edge.
- Undirected edges use 2 edge objects: A undirected edge between A & B is stored as [edge(A,B), edge(B,A)].
- Graph copying is shallow: Current copy() only copies vertex positions, names, ids, colors, & edge endpoints. Annotations are not preserved.
- Public API differs from full API: publicAPI.js does not contain every function in graphing.js.
- Parallel Edges do not exist: Between 2 vertices, only 1 directed edge can exist. E.x if there's already (A,B) in the graph, the editor will block another edge being added.
- Import/Export is lossy: Vertex metadata is not preserved. Just nodes and edge connections.
- Browser compatability: Only modern browsers can run GraphX.
