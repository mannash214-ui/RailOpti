"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StationService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
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
        const { getStaticStations } = await Promise.resolve().then(() => __importStar(require('../utils/dataLoader')));
        const staticStations = getStaticStations();
        const qLower = q.toLowerCase();
        return staticStations
            .filter(s => s.stationCode.toLowerCase().startsWith(qLower) || s.name.toLowerCase().includes(qLower))
            .slice(0, 10);
    }
}
exports.StationService = StationService;
