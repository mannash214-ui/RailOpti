import { RailwayGraph, EdgeType } from '../graph/types';
import { CostStrategy } from './CostStrategy';
import { PlannerConfig } from './PlannerConfig';
import { ConstraintChecker } from './ConstraintChecker';
import { SearchState } from './PlannerTypes';

// Custom MinHeap implementation for optimized O(log N) Priority Queue operations
class MinHeap {
  private data: SearchState[] = [];

  public push(val: SearchState): void {
    this.data.push(val);
    this.up(this.data.length - 1);
  }

  public pop(): SearchState | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const bottom = this.data.pop();
    if (this.data.length > 0 && bottom !== undefined) {
      this.data[0] = bottom;
      this.down(0);
    }
    return top;
  }

  public size(): number {
    return this.data.length;
  }

  private up(i: number): void {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.data[i].accumulatedCost < this.data[p].accumulatedCost) {
        this.swap(i, p);
        i = p;
      } else {
        break;
      }
    }
  }

  private down(i: number): void {
    const len = this.data.length;
    while (2 * i + 1 < len) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let best = i;
      if (this.data[left].accumulatedCost < this.data[best].accumulatedCost) {
        best = left;
      }
      if (right < len && this.data[right].accumulatedCost < this.data[best].accumulatedCost) {
        best = right;
      }
      if (best !== i) {
        this.swap(i, best);
        i = best;
      } else {
        break;
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.data[i];
    this.data[i] = this.data[j];
    this.data[j] = temp;
  }
}

export interface SearchResult {
  destinationStates: { nodeId: string; transfersUsed: number; cost: number }[];
  parentTable: Map<string, Map<number, { parentNodeId: string; parentTransfers: number } | null>>;
  visitedStatesCount: number;
}

export class SearchEngine {
  private readonly graph: RailwayGraph;
  private readonly config: PlannerConfig;
  private readonly costStrategy: CostStrategy;
  private readonly constraintChecker: ConstraintChecker;

  constructor(
    graph: RailwayGraph,
    config: PlannerConfig,
    costStrategy: CostStrategy,
    constraintChecker: ConstraintChecker
  ) {
    this.graph = graph;
    this.config = config;
    this.costStrategy = costStrategy;
    this.constraintChecker = constraintChecker;
  }

  /**
   * Run the state-expanded Dijkstra search algorithm
   */
  public search(
    sourceStationCode: string,
    destinationStationCode: string,
    departureMinutes: number
  ): SearchResult {
    const distTable = new Map<string, Map<number, number>>();
    const parentTable = new Map<string, Map<number, { parentNodeId: string; parentTransfers: number } | null>>();
    const pq = new MinHeap();

    // 1. Find start nodes at source station within a 48-hour window (2880 mins)
    const sourceNodes = this.graph.getStationNodes(sourceStationCode);
    const maxStartWindow = 2880;

    for (const node of sourceNodes) {
      if (
        node.absoluteDepartureMinutes >= departureMinutes &&
        node.absoluteDepartureMinutes <= departureMinutes + maxStartWindow
      ) {
        // Validate constraints on initial train boarding
        if (!this.constraintChecker.isAllowedTrainType(node.trainType)) {
          continue;
        }

        if (this.config.weekday && !node.operatingDays?.includes(this.config.weekday)) {
          continue;
        }

        const waitingMinutes = node.absoluteDepartureMinutes - departureMinutes;
        if (!this.constraintChecker.isValidWaiting(waitingMinutes)) {
          continue;
        }

        if (!this.constraintChecker.isValidJourneyDuration(departureMinutes, node.absoluteDepartureMinutes)) {
          continue;
        }

        if (!this.constraintChecker.isValidArrival(node.absoluteDepartureMinutes)) {
          continue;
        }

        // Initial cost: starting waiting time + average delay of start train
        const initialCost = this.costStrategy.calculateCost({
          travelMinutes: 0,
          waitingMinutes,
          transfers: 0,
          expectedDelay: node.averageDelayMinutes,
        });

        // Initialize state maps
        this.setTableValue(distTable, node.nodeId, 0, initialCost);
        this.setTableValue(parentTable, node.nodeId, 0, null);

        pq.push({
          nodeId: node.nodeId,
          transfersUsed: 0,
          currentTime: node.absoluteDepartureMinutes,
          currentTrainId: node.trainId,
          accumulatedCost: initialCost,
          accumulatedWaiting: waitingMinutes,
          departureTime: node.absoluteDepartureMinutes,
        });
      }
    }

    let visitedStatesCount = 0;
    const destinationStates: { nodeId: string; transfersUsed: number; cost: number }[] = [];
    let bestCost = Infinity;

    // 2. Main Dijkstra search loop
    while (pq.size() > 0) {
      const u = pq.pop()!;
      visitedStatesCount++;

      // Check cost window termination
      if (u.accumulatedCost > bestCost + this.config.costWindow) {
        break;
      }

      const uNode = this.graph.getNode(u.nodeId);
      if (!uNode) continue;

      // Check if target station reached
      if (uNode.stationCode === destinationStationCode) {
        destinationStates.push({
          nodeId: u.nodeId,
          transfersUsed: u.transfersUsed,
          cost: u.accumulatedCost,
        });

        if (bestCost === Infinity) {
          bestCost = u.accumulatedCost;
        }

        if (destinationStates.length >= this.config.k) {
          break;
        }

        // Do not expand path search out from destination station
        continue;
      }

      // Check if cost is worse than already recorded for state (u.nodeId, u.transfersUsed)
      const storedCost = this.getTableValue(distTable, u.nodeId, u.transfersUsed) ?? Infinity;
      if (u.accumulatedCost > storedCost) {
        continue;
      }

      const edges = this.graph.getNeighbors(u.nodeId);
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];

        if (edge.type === EdgeType.TRAVEL) {
          const vNode = this.graph.getNode(edge.targetNodeId);
          if (!vNode) continue;

          // Validate constraints on alighting/traveling to next stop
          if (!this.constraintChecker.isAllowedTrainType(vNode.trainType)) {
            continue;
          }

          if (this.config.weekday && !vNode.operatingDays?.includes(this.config.weekday)) {
            continue;
          }
          if (!this.constraintChecker.isValidJourneyDuration(u.departureTime, vNode.absoluteArrivalMinutes)) {
            continue;
          }
          if (!this.constraintChecker.isValidArrival(vNode.absoluteArrivalMinutes)) {
            continue;
          }

          // Determine travel minutes (include previous stop time if staying on the same train)
          let travelMinutes = edge.travelMinutes;
          if (u.currentTrainId === vNode.trainId) {
            travelMinutes += (uNode.absoluteDepartureMinutes - uNode.absoluteArrivalMinutes);
          }

          const costIncrease = this.costStrategy.calculateCost({
            travelMinutes,
            waitingMinutes: 0,
            transfers: 0,
            expectedDelay: 0,
          });

          const newCost = u.accumulatedCost + costIncrease;
          const targetCost = this.getTableValue(distTable, vNode.nodeId, u.transfersUsed) ?? Infinity;

          if (newCost < targetCost) {
            this.setTableValue(distTable, vNode.nodeId, u.transfersUsed, newCost);
            this.setTableValue(parentTable, vNode.nodeId, u.transfersUsed, {
              parentNodeId: u.nodeId,
              parentTransfers: u.transfersUsed,
            });

            pq.push({
              nodeId: vNode.nodeId,
              transfersUsed: u.transfersUsed,
              currentTime: vNode.absoluteArrivalMinutes,
              currentTrainId: vNode.trainId,
              accumulatedCost: newCost,
              accumulatedWaiting: u.accumulatedWaiting,
              departureTime: u.departureTime,
            });
          }
        } else if (edge.type === EdgeType.TRANSFER) {
          // Check maximum transfers limit constraint
          if (!this.constraintChecker.canTransfer(u.transfersUsed)) {
            continue;
          }

          const vNode = this.graph.getNode(edge.targetNodeId);
          if (!vNode) continue;

          // Determine waiting minutes during layover transfer
          const waitingMinutes = vNode.absoluteDepartureMinutes - uNode.absoluteArrivalMinutes;

          // Validate transfer time limits (min layover / max layover)
          if (!this.constraintChecker.isValidTransferTime(waitingMinutes)) {
            continue;
          }

          // Validate new transfer constraints
          if (!this.constraintChecker.isAllowedTrainType(vNode.trainType)) {
            continue;
          }

          if (this.config.weekday && !vNode.operatingDays?.includes(this.config.weekday)) {
            continue;
          }
          const newWaiting = u.accumulatedWaiting + waitingMinutes;
          if (!this.constraintChecker.isValidWaiting(waitingMinutes)) {
            continue;
          }
          if (!this.constraintChecker.isNotOvernightTransfer(uNode.absoluteArrivalMinutes, vNode.absoluteDepartureMinutes)) {
            continue;
          }
          if (!this.constraintChecker.isValidJourneyDuration(u.departureTime, vNode.absoluteDepartureMinutes)) {
            continue;
          }
          if (!this.constraintChecker.isValidArrival(vNode.absoluteDepartureMinutes)) {
            continue;
          }

          const costIncrease = this.costStrategy.calculateCost({
            travelMinutes: 0,
            waitingMinutes,
            transfers: 1,
            expectedDelay: vNode.averageDelayMinutes,
          });

          const newCost = u.accumulatedCost + costIncrease;
          const nextTransfers = u.transfersUsed + 1;
          const targetCost = this.getTableValue(distTable, vNode.nodeId, nextTransfers) ?? Infinity;

          if (newCost < targetCost) {
            this.setTableValue(distTable, vNode.nodeId, nextTransfers, newCost);
            this.setTableValue(parentTable, vNode.nodeId, nextTransfers, {
              parentNodeId: u.nodeId,
              parentTransfers: u.transfersUsed,
            });

            pq.push({
              nodeId: vNode.nodeId,
              transfersUsed: nextTransfers,
              currentTime: vNode.absoluteDepartureMinutes,
              currentTrainId: '', // Boarding a new train (set to empty to flag transfer)
              accumulatedCost: newCost,
              accumulatedWaiting: newWaiting,
              departureTime: u.departureTime,
            });
          }
        }
      }
    }

    return {
      destinationStates,
      parentTable,
      visitedStatesCount,
    };
  }

  // Helper values functions for state maps [nodeId][transfers]
  private getTableValue<T>(map: Map<string, Map<number, T>>, key1: string, key2: number): T | undefined {
    return map.get(key1)?.get(key2);
  }

  private setTableValue<T>(map: Map<string, Map<number, T>>, key1: string, key2: number, val: T): void {
    let sub = map.get(key1);
    if (!sub) {
      sub = new Map<number, T>();
      map.set(key1, sub);
    }
    sub.set(key2, val);
  }
}
