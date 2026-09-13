"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyPlanner = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
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
const error_1 = require("../../middleware/error");
const dataLoader_1 = require("../../utils/dataLoader");
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
        // Support backward compatibility / request model mapping
        const sourceClean = (request.source || request.sourceStation || '').trim();
        const destClean = (request.destination || request.destinationStation || '').trim();
        const departureTime = request.departureTime || request.departureAfter;
        const maximumTransfers = request.maxTransfers !== undefined ? request.maxTransfers : request.maximumTransfers;
        const travelDate = request.travelDate;
        if (!sourceClean || !destClean || !departureTime) {
            throw new error_1.AppError('Source, destination, and departure time are required.', 400);
        }
        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // 1. Resolve source and destination stations in MongoDB (or fallback static JSON)
        let sourceDb = null;
        let destDb = null;
        if (mongoose_1.default.connection.readyState === 1) {
            sourceDb = await station_model_1.Station.findOne({
                $or: [
                    { stationCode: sourceClean.toUpperCase() },
                    { name: new RegExp(`^${escapeRegex(sourceClean)}$`, 'i') },
                    { name: new RegExp(escapeRegex(sourceClean), 'i') },
                ],
            });
            destDb = await station_model_1.Station.findOne({
                $or: [
                    { stationCode: destClean.toUpperCase() },
                    { name: new RegExp(`^${escapeRegex(destClean)}$`, 'i') },
                    { name: new RegExp(escapeRegex(destClean), 'i') },
                ],
            });
        }
        if (!sourceDb || !destDb) {
            const staticStations = (0, dataLoader_1.getStaticStations)();
            const matchStation = (query) => {
                const qUpper = query.toUpperCase();
                return staticStations.find(s => s.stationCode === qUpper) ||
                    staticStations.find(s => s.name.toLowerCase() === query.toLowerCase()) ||
                    staticStations.find(s => s.name.toLowerCase().includes(query.toLowerCase()));
            };
            if (!sourceDb)
                sourceDb = matchStation(sourceClean);
            if (!destDb)
                destDb = matchStation(destClean);
        }
        if (!sourceDb) {
            throw new error_1.AppError(`Source station "${sourceClean}" was not found. Please choose from available stations in suggestions.`, 404);
        }
        if (!destDb) {
            throw new error_1.AppError(`Destination station "${destClean}" was not found. Please choose from available stations in suggestions.`, 404);
        }
        // 2. Parse departure time string "HH:mm" to absolute day minutes
        const parts = departureTime.split(':');
        if (parts.length !== 2) {
            throw new error_1.AppError(`Invalid departure time format: ${departureTime}. Expected HH:mm`, 400);
        }
        const departureHours = parseInt(parts[0], 10);
        const departureMinutes = parseInt(parts[1], 10);
        if (isNaN(departureHours) || isNaN(departureMinutes) || departureHours < 0 || departureHours > 23 || departureMinutes < 0 || departureMinutes > 59) {
            throw new error_1.AppError(`Invalid departure time values: ${departureTime}`, 400);
        }
        const userDepartureMinutes = departureHours * 60 + departureMinutes;
        // Validate and process travelDate
        let weekday;
        if (travelDate) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(travelDate)) {
                throw new error_1.AppError('Invalid travel date format. Expected YYYY-MM-DD.', 400);
            }
            const dateParts = travelDate.split('-');
            const y = parseInt(dateParts[0], 10);
            const m = parseInt(dateParts[1], 10) - 1;
            const d = parseInt(dateParts[2], 10);
            const dateObj = new Date(Date.UTC(y, m, d));
            if (isNaN(dateObj.getTime()) || dateObj.getUTCFullYear() !== y || dateObj.getUTCMonth() !== m || dateObj.getUTCDate() !== d) {
                throw new error_1.AppError('Invalid calendar date.', 400);
            }
            const now = new Date();
            const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
            const localParsedDate = new Date(Date.UTC(y, m, d));
            if (localParsedDate < today) {
                throw new error_1.AppError('Past travel dates are not allowed.', 400);
            }
            const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            weekday = weekdays[dateObj.getUTCDay()];
        }
        // 3. Prepare planner config, cost strategy, and constraint checker
        let arrivalBeforeAbsoluteMinutes;
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
        const config = {
            ...PlannerConfig_1.DEFAULT_PLANNER_CONFIG,
            maximumTransfers: maximumTransfers ?? PlannerConfig_1.DEFAULT_PLANNER_CONFIG.maximumTransfers,
            minimumTransferMinutes: minimumTransferMinutes ?? PlannerConfig_1.DEFAULT_PLANNER_CONFIG.minimumTransferMinutes,
            maximumWaitingMinutes: maximumWaitingMinutes ?? PlannerConfig_1.DEFAULT_PLANNER_CONFIG.maximumWaitingMinutes,
            maximumJourneyDurationMinutes: maximumJourneyDurationMinutes ?? PlannerConfig_1.DEFAULT_PLANNER_CONFIG.maximumJourneyDurationMinutes,
            allowedTrainTypes: request.allowedTrainTypes ?? PlannerConfig_1.DEFAULT_PLANNER_CONFIG.allowedTrainTypes,
            avoidOvernightTransfers: avoidOvernightTransfers ?? PlannerConfig_1.DEFAULT_PLANNER_CONFIG.avoidOvernightTransfers,
            arrivalBeforeAbsoluteMinutes,
            travelDate,
            weekday,
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
            const journey = PathReconstructor_1.PathReconstructor.reconstruct(searchResult.parentTable, state.nodeId, state.transfersUsed, this.graph, userDepartureMinutes, travelDate);
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
