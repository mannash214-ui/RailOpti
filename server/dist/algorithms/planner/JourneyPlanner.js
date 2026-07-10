"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyPlanner = void 0;
const station_model_1 = require("../../models/station.model");
const PlannerConfig_1 = require("./PlannerConfig");
const CostStrategy_1 = require("./CostStrategy");
const ConstraintChecker_1 = require("./ConstraintChecker");
const SearchEngine_1 = require("./SearchEngine");
const PathReconstructor_1 = require("./PathReconstructor");
const types_1 = require("../../models/types");
const ReliabilityCalculator_1 = require("./ReliabilityCalculator");
const DuplicateFilter_1 = require("./DuplicateFilter");
const JourneyRanker_1 = require("./JourneyRanker");
class JourneyPlanner {
    graph;
    constructor(graph) {
        this.graph = graph;
    }
    /**
     * Plan Top-K optimal itineraries matching search request constraints
     */
    async plan(request) {
        const startTime = Date.now();
        const sourceStation = request.sourceStation;
        const destinationStation = request.destinationStation;
        const departureTime = request.departureAfter;
        // 1. Resolve source and destination stations in MongoDB (by code or name)
        const sourceDb = await station_model_1.Station.findOne({
            $or: [
                { stationCode: sourceStation.toUpperCase() },
                { name: new RegExp(sourceStation, 'i') },
            ],
        });
        const destDb = await station_model_1.Station.findOne({
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
        let arrivalBeforeAbsoluteMinutes;
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
        const config = {
            ...PlannerConfig_1.DEFAULT_PLANNER_CONFIG,
            maximumTransfers: request.maximumTransfers ?? PlannerConfig_1.DEFAULT_PLANNER_CONFIG.maximumTransfers,
            minimumTransferMinutes: request.minimumTransferMinutes ?? PlannerConfig_1.DEFAULT_PLANNER_CONFIG.minimumTransferMinutes,
            maximumWaitingMinutes: request.maximumWaitingMinutes ?? PlannerConfig_1.DEFAULT_PLANNER_CONFIG.maximumWaitingMinutes,
            maximumJourneyDurationMinutes: request.maximumJourneyDurationMinutes ?? PlannerConfig_1.DEFAULT_PLANNER_CONFIG.maximumJourneyDurationMinutes,
            allowedTrainTypes: request.allowedTrainTypes ?? PlannerConfig_1.DEFAULT_PLANNER_CONFIG.allowedTrainTypes,
            avoidOvernightTransfers: request.avoidOvernightTransfers ?? PlannerConfig_1.DEFAULT_PLANNER_CONFIG.avoidOvernightTransfers,
            arrivalBeforeAbsoluteMinutes,
        };
        const costStrategy = new CostStrategy_1.CostStrategy(config);
        const constraintChecker = new ConstraintChecker_1.ConstraintChecker(config);
        const searchEngine = new SearchEngine_1.SearchEngine(this.graph, config, costStrategy, constraintChecker);
        // 4. Run the Dijkstra search
        const searchResult = searchEngine.search(sourceDb.stationCode, destDb.stationCode, userDepartureMinutes);
        // 5. Reconstruct all collected paths
        const journeys = [];
        const destStates = searchResult.destinationStates;
        for (let i = 0; i < destStates.length; i++) {
            const state = destStates[i];
            const journey = PathReconstructor_1.PathReconstructor.reconstruct(searchResult.parentTable, state.nodeId, state.transfersUsed, this.graph, userDepartureMinutes);
            if (journey) {
                // Calculate normalized reliability score (0-100)
                journey.reliabilityScore = ReliabilityCalculator_1.ReliabilityCalculator.calculate(journey.trainSegments);
                journeys.push(journey);
            }
        }
        // 6. Filter duplicates (retaining the highest-ranked version of each unique path)
        const uniqueJourneys = DuplicateFilter_1.DuplicateFilter.filter(journeys);
        // 7. Rank journeys according to chosen optimization mode (updates overallScore and sorts)
        const mode = request.optimizationMode ?? types_1.OptimizationMode.BALANCED;
        const rankedJourneys = JourneyRanker_1.JourneyRanker.rank(uniqueJourneys, mode);
        const executionTimeMs = Date.now() - startTime;
        return {
            journeys: rankedJourneys.slice(0, config.k),
            visitedStates: searchResult.visitedStatesCount,
            executionTimeMs,
        };
    }
}
exports.JourneyPlanner = JourneyPlanner;
