"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImmutableRailwayGraph = void 0;
class ImmutableRailwayGraph {
    nodes;
    adjacencyList;
    stationNodes;
    trainNodes;
    constructor(nodes, adjacencyList, stationNodes, trainNodes) {
        // Create shallow copies of structures to ensure immutability from outer reference changes
        this.nodes = new Map(nodes);
        this.adjacencyList = new Map(adjacencyList);
        this.stationNodes = new Map(stationNodes);
        this.trainNodes = new Map(trainNodes);
        // Deep freeze structures to enforce complete immutability
        Object.freeze(this.nodes);
        Object.freeze(this.adjacencyList);
        Object.freeze(this.stationNodes);
        Object.freeze(this.trainNodes);
        Object.freeze(this);
    }
    getNode(nodeId) {
        return this.nodes.get(nodeId);
    }
    getNeighbors(nodeId) {
        return this.adjacencyList.get(nodeId) || [];
    }
    getStationNodes(stationIdOrCode) {
        return this.stationNodes.get(stationIdOrCode) || [];
    }
    getTrainNodes(trainIdOrNumber) {
        return this.trainNodes.get(trainIdOrNumber) || [];
    }
    getAllNodes() {
        return Array.from(this.nodes.values());
    }
    getNodesCount() {
        return this.nodes.size;
    }
    getEdgesCount(type) {
        let total = 0;
        for (const edges of this.adjacencyList.values()) {
            if (type) {
                // Count specific type
                for (let i = 0; i < edges.length; i++) {
                    if (edges[i].type === type) {
                        total++;
                    }
                }
            }
            else {
                total += edges.length;
            }
        }
        return total;
    }
}
exports.ImmutableRailwayGraph = ImmutableRailwayGraph;
