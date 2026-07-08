"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const search_service_1 = require("../services/search.service");
class SearchController {
    static async queryOptimalItineraries(req, res, next) {
        try {
            const { origin, destination, date, maxTransfers, maxWaitTime, minReliability, } = req.query;
            // Map query variables to service layer parameters
            const results = await search_service_1.SearchService.searchOptimalItineraries({
                originCode: origin,
                destinationCode: destination,
                dateStr: date,
                maxTransfers: maxTransfers ? Number(maxTransfers) : undefined,
                maxWaitTimeMins: maxWaitTime ? Number(maxWaitTime) : undefined,
                minReliabilityIndex: minReliability ? Number(minReliability) : undefined,
            });
            res.status(200).json({
                status: 'success',
                results: results.length,
                data: { itineraries: results },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SearchController = SearchController;
exports.default = SearchController;
