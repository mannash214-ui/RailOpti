import { RailwayGraph, GraphNode, GraphEdge, EdgeType } from './types';

export class ImmutableRailwayGraph implements RailwayGraph {
  private readonly nodes: Map<string, GraphNode>;
  private readonly adjacencyList: Map<string, GraphEdge[]>;
  private readonly stationNodes: Map<string, GraphNode[]>;
  private readonly trainNodes: Map<string, GraphNode[]>;

  constructor(
    nodes: Map<string, GraphNode>,
    adjacencyList: Map<string, GraphEdge[]>,
    stationNodes: Map<string, GraphNode[]>,
    trainNodes: Map<string, GraphNode[]>
  ) {
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

  public getNode(nodeId: string): GraphNode | undefined {
    return this.nodes.get(nodeId);
  }

  public getNeighbors(nodeId: string): GraphEdge[] {
    return this.adjacencyList.get(nodeId) || [];
  }

  public getStationNodes(stationIdOrCode: string): GraphNode[] {
    return this.stationNodes.get(stationIdOrCode) || [];
  }

  public getTrainNodes(trainIdOrNumber: string): GraphNode[] {
    return this.trainNodes.get(trainIdOrNumber) || [];
  }

  public getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getNodesCount(): number {
    return this.nodes.size;
  }

  public getEdgesCount(type?: EdgeType): number {
    let total = 0;
    for (const edges of this.adjacencyList.values()) {
      if (type) {
        // Count specific type
        for (let i = 0; i < edges.length; i++) {
          if (edges[i].type === type) {
            total++;
          }
        }
      } else {
        total += edges.length;
      }
    }
    return total;
  }
}
