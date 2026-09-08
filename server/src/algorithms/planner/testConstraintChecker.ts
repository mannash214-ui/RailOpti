import { RailwayGraph, GraphNode, GraphEdge, EdgeType } from '../graph/types';
import { SearchEngine } from './SearchEngine';
import { ConstraintChecker } from './ConstraintChecker';
import { CostStrategy } from './CostStrategy';
import { PlannerConfig, DEFAULT_PLANNER_CONFIG } from './PlannerConfig';

class MockGraph implements RailwayGraph {
  private nodes = new Map<string, GraphNode>();
  private adj = new Map<string, GraphEdge[]>();
  private stationNodes = new Map<string, GraphNode[]>();

  public addNode(node: GraphNode) {
    this.nodes.set(node.nodeId, node);
    if (!this.stationNodes.has(node.stationCode)) {
      this.stationNodes.set(node.stationCode, []);
    }
    this.stationNodes.get(node.stationCode)!.push(node);
  }

  public addEdge(from: string, to: string, type: EdgeType, minutes: number, trainId?: string) {
    if (!this.adj.has(from)) {
      this.adj.set(from, []);
    }
    if (type === EdgeType.TRAVEL) {
      this.adj.get(from)!.push({
        type: EdgeType.TRAVEL,
        targetNodeId: to,
        travelMinutes: minutes,
        trainId: trainId || '',
      });
    } else {
      this.adj.get(from)!.push({
        type: EdgeType.TRANSFER,
        targetNodeId: to,
        transferMinutes: minutes,
      });
    }
  }

  public getNode(nodeId: string): GraphNode | undefined {
    return this.nodes.get(nodeId);
  }

  public getNeighbors(nodeId: string): GraphEdge[] {
    return this.adj.get(nodeId) || [];
  }

  public getStationNodes(stationCode: string): GraphNode[] {
    return this.stationNodes.get(stationCode) || [];
  }

  public getTrainNodes(_trainIdOrNumber: string): GraphNode[] {
    return [];
  }

  public getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getNodesCount(): number {
    return this.nodes.size;
  }

  public getEdgesCount(_type?: EdgeType): number {
    return 0;
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`\x1b[31m[Assertion Failed] ${message}\x1b[0m`);
    process.exit(1);
  } else {
    console.log(`\x1b[32m[Passed] ${message}\x1b[0m`);
  }
}

function createBaseNode(id: string, station: string, timeStr: string, minutes: number, trainId = 'T1'): GraphNode {
  return {
    nodeId: id,
    trainId,
    trainNumber: trainId === 'T1' ? '12428' : '12278',
    trainName: 'Mock Special',
    trainType: 'Express',
    stationId: 'mock-station-id',
    stationCode: station,
    stationName: station + ' Junction',
    stopNumber: 1,
    arrivalTime: timeStr,
    departureTime: timeStr,
    dayOffset: Math.floor(minutes / 1440),
    distanceFromSource: 0,
    cancellationProbability: 0.0,
    averageDelayMinutes: 0,
    absoluteArrivalMinutes: minutes,
    absoluteDepartureMinutes: minutes,
    operatingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  };
}

function runTests() {
  console.log('\x1b[36m[Constraints Engine Tests] Running assertions...\x1b[0m');

  // ==================================================================
  // Mock Graph Configuration
  // ==================================================================
  const graph = new MockGraph();

  // Route 1: Direct path Silchar -> Patna (Train 1)
  // Departs Day 0, 09:00 (540). Arrives Day 0, 11:00 (660) at Patna.
  graph.addNode(createBaseNode('N1', 'SCL', '09:00', 540));
  graph.addNode(createBaseNode('N2', 'PNBE', '11:00', 660));
  graph.addEdge('N1', 'N2', EdgeType.TRAVEL, 120, 'T1');

  // Route 2: Transfer path Silchar -> Guwahati -> Patna (Train 1 -> Train 2)
  // Departs Day 0, 09:00 (540). Arrives Day 0, 11:00 (660) at Guwahati.
  // Wait: 11:00 -> 12:30 (90 mins transfer layover)
  // Departs Day 0, 12:30 (750) from Guwahati on Train 2.
  // Arrives Day 0, 15:00 (900) at Patna.
  graph.addNode(createBaseNode('N3', 'GHY', '11:00', 660, 'T1'));
  graph.addNode(createBaseNode('N4', 'GHY', '12:30', 750, 'T2'));
  graph.addNode(createBaseNode('N5', 'PNBE', '15:00', 900, 'T2'));
  
  graph.addEdge('N1', 'N3', EdgeType.TRAVEL, 120, 'T1');
  graph.addEdge('N3', 'N4', EdgeType.TRANSFER, 90); // Transfer edge
  graph.addEdge('N4', 'N5', EdgeType.TRAVEL, 150, 'T2');

  // Route 3: Overnight Transfer Silchar -> Guwahati -> Patna
  // Train 1 Arrives Guwahati Day 0, 23:45 (1425).
  // Train 3 Departs Guwahati Day 1, 06:30 (1440 + 390 = 1830).
  graph.addNode(createBaseNode('N6', 'GHY', '23:45', 1425, 'T1'));
  graph.addNode(createBaseNode('N7', 'GHY', '06:30', 1830, 'T3'));
  graph.addNode(createBaseNode('N8', 'PNBE', '10:00', 2040, 'T3'));

  graph.addEdge('N1', 'N6', EdgeType.TRAVEL, 885, 'T1');
  graph.addEdge('N6', 'N7', EdgeType.TRANSFER, 405);
  graph.addEdge('N7', 'N8', EdgeType.TRAVEL, 210, 'T3');

  // Route 4: Same Train stop (no transfer count and no penalties)
  // N1 -> N3 (GHY) -> N9 (GHY stop, same train) -> N10 (PNBE)
  graph.addNode(createBaseNode('N9', 'GHY', '11:15', 675, 'T1'));
  graph.addNode(createBaseNode('N10', 'PNBE', '13:00', 780, 'T1'));
  graph.addEdge('N3', 'N9', EdgeType.TRAVEL, 15, 'T1'); // stay on same train
  graph.addEdge('N9', 'N10', EdgeType.TRAVEL, 105, 'T1');

  // ==================================================================
  // Test Cases
  // ==================================================================

  // 1. Arrival Before Accepted
  {
    const config: PlannerConfig = {
      ...DEFAULT_PLANNER_CONFIG,
      k: 1,
      arrivalBeforeAbsoluteMinutes: 700, // 11:40
    };
    const engine = new SearchEngine(graph, config, new CostStrategy(config), new ConstraintChecker(config));
    const result = engine.search('SCL', 'PNBE', 540);
    assert(result.destinationStates.length > 0, 'Arrival Before Accepted: Found route arriving at 11:00 (Limit: 11:40)');
  }

  // 2. Arrival Before Rejected
  {
    const config: PlannerConfig = {
      ...DEFAULT_PLANNER_CONFIG,
      k: 1,
      arrivalBeforeAbsoluteMinutes: 630, // 10:30
    };
    const engine = new SearchEngine(graph, config, new CostStrategy(config), new ConstraintChecker(config));
    const result = engine.search('SCL', 'PNBE', 540);
    assert(result.destinationStates.length === 0, 'Arrival Before Rejected: Filtered route arriving at 11:00 (Limit: 10:30)');
  }

  // 3. Maximum Waiting Accepted
  {
    const config: PlannerConfig = {
      ...DEFAULT_PLANNER_CONFIG,
      k: 5,
      maximumWaitingMinutes: 100, // Transfer wait is 90 mins
      costWindow: 5000,
    };
    const engine = new SearchEngine(graph, config, new CostStrategy(config), new ConstraintChecker(config));
    const result = engine.search('SCL', 'PNBE', 540);
    // Should find at least the transfer route (N1 -> N3 -> N4 -> N5)
    const hasTransferRoute = result.destinationStates.some(s => s.transfersUsed === 1);
    assert(hasTransferRoute, 'Maximum Waiting Accepted: Found 90 mins transfer layover route (Limit: 100 mins)');
  }

  // 4. Maximum Waiting Rejected
  {
    const config: PlannerConfig = {
      ...DEFAULT_PLANNER_CONFIG,
      k: 5,
      maximumWaitingMinutes: 60, // Transfer wait is 90 mins
      costWindow: 5000,
    };
    const engine = new SearchEngine(graph, config, new CostStrategy(config), new ConstraintChecker(config));
    const result = engine.search('SCL', 'PNBE', 540);
    const hasTransferRoute = result.destinationStates.some(s => s.transfersUsed === 1);
    assert(!hasTransferRoute, 'Maximum Waiting Rejected: Filtered out 90 mins transfer layover route (Limit: 60 mins)');
  }

  // 5. Maximum Duration Accepted
  {
    const config: PlannerConfig = {
      ...DEFAULT_PLANNER_CONFIG,
      k: 1,
      maximumJourneyDurationMinutes: 200, // Direct takes 120 mins (660 arrival - 540 departure)
    };
    const engine = new SearchEngine(graph, config, new CostStrategy(config), new ConstraintChecker(config));
    const result = engine.search('SCL', 'PNBE', 540);
    assert(result.destinationStates.length > 0, 'Maximum Duration Accepted: Direct route takes 120 mins (Limit: 200 mins)');
  }

  // 6. Maximum Duration Rejected
  {
    const config: PlannerConfig = {
      ...DEFAULT_PLANNER_CONFIG,
      k: 1,
      maximumJourneyDurationMinutes: 100, // Direct takes 120 mins
    };
    const engine = new SearchEngine(graph, config, new CostStrategy(config), new ConstraintChecker(config));
    const result = engine.search('SCL', 'PNBE', 540);
    assert(result.destinationStates.length === 0, 'Maximum Duration Rejected: Filtered direct route because it takes 120 mins (Limit: 100 mins)');
  }

  // 7. Overnight Transfer Rejected
  {
    const config: PlannerConfig = {
      ...DEFAULT_PLANNER_CONFIG,
      k: 5,
      avoidOvernightTransfers: true,
      costWindow: 5000,
    };
    const engine = new SearchEngine(graph, config, new CostStrategy(config), new ConstraintChecker(config));
    const result = engine.search('SCL', 'PNBE', 540);
    // overnight route arrives GHY at Day 0 23:45, departs Day 1 06:30
    const hasOvernightRoute = result.destinationStates.some(s => s.nodeId === 'N8');
    assert(!hasOvernightRoute, 'Overnight Transfer Rejected: Filtered out transfer crossing midnight calendar days (avoidOvernightTransfers: true)');
  }

  // 8. Staying on same train does not increase transfers
  {
    const config: PlannerConfig = {
      ...DEFAULT_PLANNER_CONFIG,
      k: 5,
      costWindow: 5000,
    };
    const engine = new SearchEngine(graph, config, new CostStrategy(config), new ConstraintChecker(config));
    const result = engine.search('SCL', 'PNBE', 540);
    // Find the state that followed the same train (N1 -> N3 -> N9 -> N10)
    const sameTrainState = result.destinationStates.find(s => s.nodeId === 'N10');
    assert(sameTrainState !== undefined && sameTrainState.transfersUsed === 0, 'Same Train Behavior: Moving along TRAVEL edges on the same train does not increase transfersCount');
  }

  console.log('\n\x1b[32m[Constraints Engine Tests] All unit tests passed successfully!\x1b[0m\n');
}

runTests();
