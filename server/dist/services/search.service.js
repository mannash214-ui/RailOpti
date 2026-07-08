"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const routing_1 = require("../algorithms/routing");
const error_1 = require("../middleware/error");
class SearchService {
    /**
     * Conducts journey optimization pathfinding.
     */
    static async searchOptimalItineraries(params) {
        const { originCode, destinationCode, dateStr, maxTransfers = 2, maxWaitTimeMins = 60, minReliabilityIndex = 80, } = params;
        if (!originCode || !destinationCode || !dateStr) {
            throw new error_1.AppError('Origin, destination, and travel date are required search inputs.', 400);
        }
        const travelDate = new Date(dateStr);
        if (isNaN(travelDate.getTime())) {
            throw new error_1.AppError('Invalid date format.', 400);
        }
        // Call the decoupled optimization engine
        const routes = await routing_1.RoutingEngine.computeOptimalRoutes(originCode.toUpperCase(), destinationCode.toUpperCase(), travelDate, {
            maxTransfers: Number(maxTransfers),
            maxWaitTimeMins: Number(maxWaitTimeMins),
            minReliabilityIndex: Number(minReliabilityIndex),
        });
        return routes;
    }
}
exports.SearchService = SearchService;
