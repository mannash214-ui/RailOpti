import { RailwayGraph } from '../graph/types';
import { Station } from '../../models/station.model';
import { PlannerConfig, DEFAULT_PLANNER_CONFIG } from './PlannerConfig';
import { CostStrategy } from './CostStrategy';
import { ConstraintChecker } from './ConstraintChecker';
import { SearchEngine } from './SearchEngine';
import { PathReconstructor } from './PathReconstructor';
import { Journey, SearchRequest } from './PlannerTypes';

import { OptimizationMode } from '../../models/types';
import { ReliabilityCalculator } from './ReliabilityCalculator';
import { DuplicateFilter } from './DuplicateFilter';
import { JourneyRanker } from './JourneyRanker';

export interface PlanResult {
  journeys: Journey[];
  visitedStates: number;
  executionTimeMs: number;
}

export class JourneyPlanner {
  private readonly graph: RailwayGraph;

  constructor(graph: RailwayGraph) {
    this.graph = graph;
  }

  /**
   * Plan Top-K optimal itineraries matching search request constraints
   */
  public async plan(
    request: SearchRequest
  ): Promise<PlanResult | null> {
    const startTime = Date.now();

    const sourceStation = request.sourceStation;
    const destinationStation = request.destinationStation;
    const departureTime = request.departureAfter;

    // 1. Resolve source and destination stations in MongoDB (by code or name)
    const sourceDb = await Station.findOne({
      $or: [
        { stationCode: sourceStation.toUpperCase() },
        { name: new RegExp(sourceStation, 'i') },
      ],
    });

    const destDb = await Station.findOne({
      $or: [
        { stationCode: destinationStation.toUpperCase() },
        { name: new RegExp(destinationStation, 'i') },
      ],
    });

    if (!sourceDb || !destDb) {
      console.warn(`[JourneyPlanner] Failed to resolve stations: Source found: ${!!sourceDb}, Dest found: ${!!destDb}`);
      return null;
    }

    // 2. Parse departure time string "HH:mm" to absolute day minutes
    const parts = departureTime.split(':');
    if (parts.length !== 2) {
      throw new Error(`Invalid departure time format: ${departureTime}. Expected HH:mm`);
    }
    const departureHours = parseInt(parts[0], 10);
    const departureMinutes = parseInt(parts[1], 10);
    const userDepartureMinutes = departureHours * 60 + departureMinutes;

    // 3. Prepare planner config, cost strategy, and constraint checker
    let arrivalBeforeAbsoluteMinutes: number | undefined;
    if (request.arrivalBefore) {
      const arrParts = request.arrivalBefore.split(':');
      if (arrParts.length === 2) {
        const arrHours = parseInt(arrParts[0], 10);
        const arrMins = parseInt(arrParts[1], 10);
        let absArrMins = arrHours * 60 + arrMins;
        if (absArrMins < userDepartureMinutes) {
          absArrMins += 1440; // Next day
        }
        arrivalBeforeAbsoluteMinutes = absArrMins;
      }
    }

    const config: PlannerConfig = {
      ...DEFAULT_PLANNER_CONFIG,
      maximumTransfers: request.maximumTransfers ?? DEFAULT_PLANNER_CONFIG.maximumTransfers,
      minimumTransferMinutes: request.minimumTransferMinutes ?? DEFAULT_PLANNER_CONFIG.minimumTransferMinutes,
      maximumWaitingMinutes: request.maximumWaitingMinutes ?? DEFAULT_PLANNER_CONFIG.maximumWaitingMinutes,
      maximumJourneyDurationMinutes: request.maximumJourneyDurationMinutes ?? DEFAULT_PLANNER_CONFIG.maximumJourneyDurationMinutes,
      allowedTrainTypes: request.allowedTrainTypes ?? DEFAULT_PLANNER_CONFIG.allowedTrainTypes,
      avoidOvernightTransfers: request.avoidOvernightTransfers ?? DEFAULT_PLANNER_CONFIG.avoidOvernightTransfers,
      arrivalBeforeAbsoluteMinutes,
    };

    const costStrategy = new CostStrategy(config);
    const constraintChecker = new ConstraintChecker(config);
    const searchEngine = new SearchEngine(this.graph, config, costStrategy, constraintChecker);

    // 4. Run the Dijkstra search
    const searchResult = searchEngine.search(
      sourceDb.stationCode,
      destDb.stationCode,
      userDepartureMinutes
    );

    // 5. Reconstruct all collected paths
    const journeys: Journey[] = [];
    const destStates = searchResult.destinationStates;

    for (let i = 0; i < destStates.length; i++) {
      const state = destStates[i];
      const journey = PathReconstructor.reconstruct(
        searchResult.parentTable,
        state.nodeId,
        state.transfersUsed,
        this.graph,
        userDepartureMinutes
      );

      if (journey) {
        // Calculate normalized reliability score (0-100)
        journey.reliabilityScore = ReliabilityCalculator.calculate(journey.trainSegments);
        journeys.push(journey);
      }
    }

    // 6. Filter duplicates (retaining the highest-ranked version of each unique path)
    const uniqueJourneys = DuplicateFilter.filter(journeys);

    // 7. Rank journeys according to chosen optimization mode (updates overallScore and sorts)
    const mode = (request.optimizationMode as OptimizationMode) ?? OptimizationMode.BALANCED;
    const rankedJourneys = JourneyRanker.rank(uniqueJourneys, mode);

    const executionTimeMs = Date.now() - startTime;

    return {
      journeys: rankedJourneys.slice(0, config.k),
      visitedStates: searchResult.visitedStatesCount,
      executionTimeMs,
    };
  }
}
