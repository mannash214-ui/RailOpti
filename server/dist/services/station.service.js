"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StationService = void 0;
const station_model_1 = require("../models/station.model");
class StationService {
    /**
     * Retrieves all active stations sorted alphabetically by name.
     */
    static async getAllStations() {
        return station_model_1.Station.find({ isActive: true }).sort({ name: 1 });
    }
    /**
     * Find a station by its 3-letter station code.
     */
    static async getStationByCode(code) {
        return station_model_1.Station.findOne({ code: code.toUpperCase(), isActive: true });
    }
    /**
     * Admin: Creates a new station node.
     */
    static async createStation(stationData) {
        return station_model_1.Station.create(stationData);
    }
}
exports.StationService = StationService;
