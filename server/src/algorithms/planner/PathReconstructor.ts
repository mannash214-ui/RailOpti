import { RailwayGraph, GraphNode } from '../graph/types';
import { Journey, TrainSegment, formatMinutesToTime } from './PlannerTypes';

export class PathReconstructor {
  /**
   * Trace parents and compile graph nodes into formatted journey with segments
   */
  public static reconstruct(
    parentTable: Map<string, Map<number, { parentNodeId: string; parentTransfers: number } | null>>,
    endNodeId: string,
    endTransfers: number,
    graph: RailwayGraph,
    userDepartureMinutes: number
  ): Journey | undefined {
    let currNodeId = endNodeId;
    let currTransfers = endTransfers;
    const pathNodes: GraphNode[] = [];

    // Traverse backwards from target using parent pointer state map
    while (currNodeId) {
      const node = graph.getNode(currNodeId);
      if (!node) break;
      pathNodes.push(node);

      const parent = parentTable.get(currNodeId)?.get(currTransfers);
      if (!parent) {
        break; // reached start node
      }
      currNodeId = parent.parentNodeId;
      currTransfers = parent.parentTransfers;
    }

    if (pathNodes.length === 0) {
      return undefined;
    }
    
    // Reverse to establish path in chronological start-to-end order
    pathNodes.reverse();

    const startNode = pathNodes[0];
    const destinationNode = pathNodes[pathNodes.length - 1];

    const trainSegments: TrainSegment[] = [];
    let travelTimeMinutes = 0;
    let waitingTimeMinutes = 0;

    // Track initial waiting time at origin station
    const startWaitingTime = startNode.absoluteDepartureMinutes - userDepartureMinutes;
    waitingTimeMinutes += Math.max(0, startWaitingTime);

    let currentSegmentStart = startNode;

    for (let i = 0; i < pathNodes.length - 1; i++) {
      const curr = pathNodes[i];
      const next = pathNodes[i + 1];

      if (curr.trainId !== next.trainId) {
        // Change of train represents transfer layover
        const segmentTravel = curr.absoluteArrivalMinutes - currentSegmentStart.absoluteDepartureMinutes;
        travelTimeMinutes += segmentTravel;

        trainSegments.push({
          trainNumber: currentSegmentStart.trainNumber,
          trainName: currentSegmentStart.trainName,
          fromStationCode: currentSegmentStart.stationCode,
          fromStationName: currentSegmentStart.stationName,
          toStationCode: curr.stationCode,
          toStationName: curr.stationName,
          departureTime: formatMinutesToTime(currentSegmentStart.absoluteDepartureMinutes),
          arrivalTime: formatMinutesToTime(curr.absoluteArrivalMinutes),
          travelMinutes: segmentTravel,
          cancellationProbability: currentSegmentStart.cancellationProbability,
          averageDelayMinutes: currentSegmentStart.averageDelayMinutes,
        });

        // Add the waiting duration of transfer layover
        const transferWait = next.absoluteDepartureMinutes - curr.absoluteArrivalMinutes;
        waitingTimeMinutes += transferWait;

        // Reset segment starting stop to the newly boarded train stop
        currentSegmentStart = next;
      }
    }

    // Add final trailing train segment
    const lastNode = pathNodes[pathNodes.length - 1];
    const finalSegmentTravel = lastNode.absoluteArrivalMinutes - currentSegmentStart.absoluteDepartureMinutes;
    travelTimeMinutes += finalSegmentTravel;

    trainSegments.push({
      trainNumber: currentSegmentStart.trainNumber,
      trainName: currentSegmentStart.trainName,
      fromStationCode: currentSegmentStart.stationCode,
      fromStationName: currentSegmentStart.stationName,
      toStationCode: lastNode.stationCode,
      toStationName: lastNode.stationName,
      departureTime: formatMinutesToTime(currentSegmentStart.absoluteDepartureMinutes),
      arrivalTime: formatMinutesToTime(lastNode.absoluteArrivalMinutes),
      travelMinutes: finalSegmentTravel,
      cancellationProbability: currentSegmentStart.cancellationProbability,
      averageDelayMinutes: currentSegmentStart.averageDelayMinutes,
    });

    const totalTimeMinutes = travelTimeMinutes + waitingTimeMinutes;

    return {
      departureStation: startNode.stationName,
      departureStationCode: startNode.stationCode,
      destinationStation: destinationNode.stationName,
      destinationStationCode: destinationNode.stationCode,
      departureTime: formatMinutesToTime(startNode.absoluteDepartureMinutes),
      arrivalTime: formatMinutesToTime(destinationNode.absoluteArrivalMinutes),
      totalTimeMinutes,
      travelTimeMinutes,
      waitingTimeMinutes,
      transferCount: endTransfers,
      reliabilityScore: 0,
      overallScore: 0,
      trainSegments,
    };
  }
}
