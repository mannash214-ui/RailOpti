import mongoose from 'mongoose';
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
import { AppError } from '../../middleware/error';

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

    // Support backward compatibility / request model mapping
    const sourceClean = (request.source || request.sourceStation || '').trim();
    const destClean = (request.destination || request.destinationStation || '').trim();
    const departureTime = request.departureTime || request.departureAfter;
    const maximumTransfers = request.maxTransfers !== undefined ? request.maxTransfers : request.maximumTransfers;
    const travelDate = request.travelDate;

    if (!sourceClean || !destClean || !departureTime) {
      throw new AppError('Source, destination, and departure time are required.', 400);
    }

    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 1. Resolve source and destination stations in MongoDB (or fallback static JSON)
    let sourceDb: any = null;
    let destDb: any = null;

    if (mongoose.connection.readyState === 1) {
      sourceDb = await Station.findOne({
        $or: [
          { stationCode: sourceClean.toUpperCase() },
          { name: new RegExp(`^${escapeRegex(sourceClean)}$`, 'i') },
          { name: new RegExp(escapeRegex(sourceClean), 'i') },
        ],
      });

      destDb = await Station.findOne({
        $or: [
          { stationCode: destClean.toUpperCase() },
          { name: new RegExp(`^${escapeRegex(destClean)}$`, 'i') },
          { name: new RegExp(escapeRegex(destClean), 'i') },
        ],
      });
    }

    if (!sourceDb || !destDb) {
      const { getStaticStations } = await import('../../utils/dataLoader');
      const staticStations = getStaticStations();
      const matchStation = (query: string) => {
        const qUpper = query.toUpperCase();
        return staticStations.find(s => s.stationCode === qUpper) ||
               staticStations.find(s => s.name.toLowerCase() === query.toLowerCase()) ||
               staticStations.find(s => s.name.toLowerCase().includes(query.toLowerCase()));
      };
      if (!sourceDb) sourceDb = matchStation(sourceClean);
      if (!destDb) destDb = matchStation(destClean);
    }

    if (!sourceDb) {
      throw new AppError(`Source station "${sourceClean}" was not found. Please choose from available stations in suggestions.`, 404);
    }
    if (!destDb) {
      throw new AppError(`Destination station "${destClean}" was not found. Please choose from available stations in suggestions.`, 404);
    }

    // 2. Parse departure time string "HH:mm" to absolute day minutes
    const parts = departureTime.split(':');
    if (parts.length !== 2) {
      throw new AppError(`Invalid departure time format: ${departureTime}. Expected HH:mm`, 400);
    }
    const departureHours = parseInt(parts[0], 10);
    const departureMinutes = parseInt(parts[1], 10);
    if (isNaN(departureHours) || isNaN(departureMinutes) || departureHours < 0 || departureHours > 23 || departureMinutes < 0 || departureMinutes > 59) {
      throw new AppError(`Invalid departure time values: ${departureTime}`, 400);
    }
    const userDepartureMinutes = departureHours * 60 + departureMinutes;

    // Validate and process travelDate
    let weekday: string | undefined;
    if (travelDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(travelDate)) {
        throw new AppError('Invalid travel date format. Expected YYYY-MM-DD.', 400);
      }
      const dateParts = travelDate.split('-');
      const y = parseInt(dateParts[0], 10);
      const m = parseInt(dateParts[1], 10) - 1;
      const d = parseInt(dateParts[2], 10);
      const dateObj = new Date(Date.UTC(y, m, d));
      if (isNaN(dateObj.getTime()) || dateObj.getUTCFullYear() !== y || dateObj.getUTCMonth() !== m || dateObj.getUTCDate() !== d) {
        throw new AppError('Invalid calendar date.', 400);
      }

      const now = new Date();
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const localParsedDate = new Date(Date.UTC(y, m, d));
      if (localParsedDate < today) {
        throw new AppError('Past travel dates are not allowed.', 400);
      }

      const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      weekday = weekdays[dateObj.getUTCDay()];
    }

    // 3. Prepare planner config, cost strategy, and constraint checker
    let arrivalBeforeAbsoluteMinutes: number | undefined;
    const adv = request.advancedConstraints || {};
    const arrivalBefore = adv.arrivalBefore || request.arrivalBefore;
    const minimumTransferMinutes = adv.minimumTransferMinutes ?? request.minimumTransferMinutes;
    const maximumWaitingMinutes = adv.maximumWaitingMinutes ?? request.maximumWaitingMinutes;
    const maximumJourneyDurationMinutes = adv.maximumJourneyDurationMinutes ?? request.maximumJourneyDurationMinutes;
    const avoidOvernightTransfers = adv.avoidOvernightTransfers !== undefined ? adv.avoidOvernightTransfers : request.avoidOvernightTransfers;

    if (arrivalBefore) {
      const arrParts = arrivalBefore.split(':');
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
      maximumTransfers: maximumTransfers ?? DEFAULT_PLANNER_CONFIG.maximumTransfers,
      minimumTransferMinutes: minimumTransferMinutes ?? DEFAULT_PLANNER_CONFIG.minimumTransferMinutes,
      maximumWaitingMinutes: maximumWaitingMinutes ?? DEFAULT_PLANNER_CONFIG.maximumWaitingMinutes,
      maximumJourneyDurationMinutes: maximumJourneyDurationMinutes ?? DEFAULT_PLANNER_CONFIG.maximumJourneyDurationMinutes,
      allowedTrainTypes: request.allowedTrainTypes ?? DEFAULT_PLANNER_CONFIG.allowedTrainTypes,
      avoidOvernightTransfers: avoidOvernightTransfers ?? DEFAULT_PLANNER_CONFIG.avoidOvernightTransfers,
      arrivalBeforeAbsoluteMinutes,
      travelDate,
      weekday,
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
        userDepartureMinutes,
        travelDate
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
