import mongoose from 'mongoose';
import { connectDB } from '../../config/db';
import { TrainStop } from '../../models/trainStop.model';
import { Train } from '../../models/train.model';
import { Station } from '../../models/station.model';
import { GraphNode, GraphEdge, EdgeType, RailwayGraph } from './types';
import { ImmutableRailwayGraph } from './graph';

export interface GraphBuilderOptions {
  minTransferTime?: number; // In minutes, default 20
  maxTransferTime?: number; // In minutes, default 1440 (24 hours) to prevent excessive edges
}

export class GraphBuilder {
  private readonly minTransferTime: number;
  private readonly maxTransferTime: number;

  constructor(options?: GraphBuilderOptions) {
    this.minTransferTime = options?.minTransferTime ?? 20;
    this.maxTransferTime = options?.maxTransferTime ?? 1440;
  }

  /**
   * Main build function that loads from DB and builds the immutable graph
   */
  public async build(): Promise<RailwayGraph> {
    // Reference imported models to register schemas and satisfy noUnusedLocals TS flag
    if (!Train.modelName || !Station.modelName) {
      throw new Error('Models failed to load');
    }

    // 1. Ensure DB Connection is initialized
    if (mongoose.connection.readyState !== 1) {
      console.log('[GraphBuilder] Connecting to database...');
      await connectDB();
    }

    console.log('[GraphBuilder] Querying train stops from database...');
    // Query train stops and populate references
    const stops = await TrainStop.find()
      .populate('trainId')
      .populate('stationId')
      .exec();

    console.log(`[GraphBuilder] Loaded ${stops.length} TrainStop events. Building nodes...`);

    const nodesMap = new Map<string, GraphNode>();
    const adjacencyList = new Map<string, GraphEdge[]>();
    
    // Groupings for index querying
    const stationNodesMap = new Map<string, GraphNode[]>();
    const trainNodesMap = new Map<string, GraphNode[]>();

    // 2. Build nodes and compute absolute day minutes
    for (const stop of stops) {
      const train = stop.trainId as any;
      const station = stop.stationId as any;

      if (!train || !station) {
        // Skip orphaned train stops if any
        continue;
      }

      const nodeId = stop._id.toString();

      // Convert times to day-offset minutes from start of Day 0
      const arrMins = this.parseTimeToMinutes(stop.arrivalTime);
      const depMins = this.parseTimeToMinutes(stop.departureTime);

      const absoluteArrivalMinutes = stop.arrivalTime === 'Source'
        ? stop.dayOffset * 1440 + depMins // Arrived at start time
        : stop.dayOffset * 1440 + arrMins;

      const absoluteDepartureMinutes = stop.departureTime === 'Destination'
        ? stop.dayOffset * 1440 + arrMins // Departure matches terminal arrival
        : stop.dayOffset * 1440 + depMins;

      const node: GraphNode = {
        nodeId,
        trainId: train._id.toString(),
        trainNumber: train.trainNumber,
        stationId: station._id.toString(),
        stationCode: station.stationCode,
        stationName: station.name,
        stopNumber: stop.stopNumber,
        arrivalTime: stop.arrivalTime,
        departureTime: stop.departureTime,
        dayOffset: stop.dayOffset,
        distanceFromSource: stop.distanceFromSource,
        platform: stop.platform,
        trainName: train.trainName,
        trainType: train.trainType,
        averageDelayMinutes: train.averageDelayMinutes ?? 0,
        cancellationProbability: train.cancellationProbability ?? 0.0,
        absoluteArrivalMinutes,
        absoluteDepartureMinutes,
        operatingDays: train.operatingDays || [],
      };

      nodesMap.set(nodeId, node);
      adjacencyList.set(nodeId, []);

      // Index by station Code and ID
      this.addToMultiMap(stationNodesMap, node.stationCode, node);
      this.addToMultiMap(stationNodesMap, node.stationId, node);

      // Index by train Number and ID
      this.addToMultiMap(trainNodesMap, node.trainNumber, node);
      this.addToMultiMap(trainNodesMap, node.trainId, node);
    }

    // 3. Construct TRAVEL edges (within same train sequence)
    console.log('[GraphBuilder] Constructing TRAVEL edges...');
    const trainIds = Array.from(new Set(Array.from(nodesMap.values()).map(n => n.trainId)));
    for (const tId of trainIds) {
      const trainStopsList = trainNodesMap.get(tId) || [];
      // Sort sequentially
      const sortedStops = [...trainStopsList].sort((a, b) => a.stopNumber - b.stopNumber);

      for (let i = 0; i < sortedStops.length - 1; i++) {
        const currentStop = sortedStops[i];
        const nextStop = sortedStops[i + 1];

        // travelMinutes is the time from departing currentStop to arriving at nextStop
        const travelMinutes = nextStop.absoluteArrivalMinutes - currentStop.absoluteDepartureMinutes;

        const travelEdge: GraphEdge = {
          type: EdgeType.TRAVEL,
          targetNodeId: nextStop.nodeId,
          travelMinutes: Math.max(0, travelMinutes), // Ensure non-negative
          trainId: tId,
        };

        adjacencyList.get(currentStop.nodeId)!.push(travelEdge);
      }
    }

    // 4. Construct TRANSFER edges (at same stations, across different trains)
    console.log('[GraphBuilder] Constructing TRANSFER edges...');
    const stationIds = Array.from(new Set(Array.from(nodesMap.values()).map(n => n.stationId)));
    for (const sId of stationIds) {
      const stationStopsList = stationNodesMap.get(sId) || [];
      
      // Sort by departure time for binary search lookup
      const sortedDepartures = [...stationStopsList].sort(
        (a, b) => a.absoluteDepartureMinutes - b.absoluteDepartureMinutes
      );

      for (const arrivalNode of stationStopsList) {
        const arrMins = arrivalNode.absoluteArrivalMinutes;
        const minDepTime = arrMins + this.minTransferTime;
        const maxDepTime = arrMins + this.maxTransferTime;

        // Perform Binary Search to find first departure >= minDepTime
        let low = 0;
        let high = sortedDepartures.length - 1;
        let startIdx = -1;

        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          if (sortedDepartures[mid].absoluteDepartureMinutes >= minDepTime) {
            startIdx = mid;
            high = mid - 1; // Search left to find first occurrence
          } else {
            low = mid + 1;
          }
        }

        // If a valid start index is found, link transfers
        if (startIdx !== -1) {
          for (let k = startIdx; k < sortedDepartures.length; k++) {
            const departureNode = sortedDepartures[k];

            // Exceeds maxTransferTime window -> stop linking
            if (departureNode.absoluteDepartureMinutes > maxDepTime) {
              break;
            }

            // Avoid transfer edge to the same train
            if (arrivalNode.trainId !== departureNode.trainId) {
              const transferEdge: GraphEdge = {
                type: EdgeType.TRANSFER,
                targetNodeId: departureNode.nodeId,
                transferMinutes: departureNode.absoluteDepartureMinutes - arrMins,
              };

              adjacencyList.get(arrivalNode.nodeId)!.push(transferEdge);
            }
          }
        }
      }
    }

    console.log('[GraphBuilder] Graph compilation complete.');
    return new ImmutableRailwayGraph(nodesMap, adjacencyList, stationNodesMap, trainNodesMap);
  }

  /**
   * Helper to parse time string HH:mm to minutes
   */
  private parseTimeToMinutes(timeStr: string): number {
    if (timeStr === 'Source' || timeStr === 'Destination') {
      return 0;
    }
    const parts = timeStr.split(':');
    if (parts.length !== 2) {
      return 0;
    }
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return (isNaN(hours) ? 0 : hours) * 60 + (isNaN(minutes) ? 0 : minutes);
  }

  /**
   * Helper to append an element to a multi-map (Map of Arrays)
   */
  private addToMultiMap<K, V>(map: Map<K, V[]>, key: K, value: V): void {
    let list = map.get(key);
    if (!list) {
      list = [];
      map.set(key, list);
    }
    list.push(value);
  }
}
