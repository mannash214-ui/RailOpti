"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StationService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const station_model_1 = require("../models/station.model");
const dataLoader_1 = require("../utils/dataLoader");
class StationService {
    /**
     * Retrieves all active stations sorted alphabetically by name.
     */
    static async getAllStations() {
        if (mongoose_1.default.connection.readyState === 1) {
            try {
                const dbResults = await station_model_1.Station.find().sort({ name: 1 });
                if (dbResults && dbResults.length > 0)
                    return dbResults;
            }
            catch (err) {
                console.warn('[StationService] DB query failed, using static stations.');
            }
        }
        return (0, dataLoader_1.getStaticStations)();
    }
    /**
     * Find a station by its 3-letter station code.
     */
    static async getStationByCode(code) {
        if (mongoose_1.default.connection.readyState === 1) {
            try {
                const dbRes = await station_model_1.Station.findOne({ stationCode: code.toUpperCase() });
                if (dbRes)
                    return dbRes;
            }
            catch (err) {
                // Fallback
            }
        }
        return (0, dataLoader_1.getStaticStations)().find(s => s.stationCode === code.toUpperCase()) || null;
    }
    /**
     * Admin: Creates a new station node.
     */
    static async createStation(stationData) {
        return station_model_1.Station.create(stationData);
    }
    /**
     * Search stations matching query q by name or code.
     */
    static async searchStations(q) {
        if (!q)
            return [];
        if (mongoose_1.default.connection.readyState === 1) {
            const dbResults = await station_model_1.Station.find({
                $or: [
                    { stationCode: new RegExp(`^${q}`, 'i') },
                    { name: new RegExp(q, 'i') },
                ],
            }).limit(10);
            if (dbResults && dbResults.length > 0) {
                return dbResults;
            }
        }
        const staticStations = (0, dataLoader_1.getStaticStations)();
        const qLower = q.toLowerCase();
        return staticStations
            .filter(s => s.stationCode.toLowerCase().startsWith(qLower) || s.name.toLowerCase().includes(qLower))
            .slice(0, 10);
    }
}
exports.StationService = StationService;
