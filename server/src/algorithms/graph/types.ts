export interface GraphNode {
  nodeId: string;
  trainId: string;
  trainNumber: string;
  stationId: string;
  stationCode: string;
  stationName: string;
  stopNumber: number;
  arrivalTime: string;
  departureTime: string;
  dayOffset: number;
  distanceFromSource: number;
  platform?: string;
  trainName: string;
  trainType: string;
  averageDelayMinutes: number;
  cancellationProbability: number;
  absoluteArrivalMinutes: number;   // Calculated absolute arrival mins from Day 0, 00:00
  absoluteDepartureMinutes: number; // Calculated absolute departure mins from Day 0, 00:00
  operatingDays: string[];
}

export enum EdgeType {
  TRAVEL = 'TRAVEL',
  TRANSFER = 'TRANSFER',
}

export interface TravelEdge {
  type: EdgeType.TRAVEL;
  targetNodeId: string;
  travelMinutes: number;
  trainId: string;
}

export interface TransferEdge {
  type: EdgeType.TRANSFER;
  targetNodeId: string;
  transferMinutes: number;
}

export type GraphEdge = TravelEdge | TransferEdge;

export interface RailwayGraph {
  getNode(nodeId: string): GraphNode | undefined;
  getNeighbors(nodeId: string): GraphEdge[];
  getStationNodes(stationIdOrCode: string): GraphNode[];
  getTrainNodes(trainIdOrNumber: string): GraphNode[];
  getAllNodes(): GraphNode[];
  getNodesCount(): number;
  getEdgesCount(type?: EdgeType): number;
}
