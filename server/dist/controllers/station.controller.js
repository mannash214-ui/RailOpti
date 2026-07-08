"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StationController = void 0;
const station_service_1 = require("../services/station.service");
class StationController {
    static async getAll(_req, res, next) {
        try {
            const stations = await station_service_1.StationService.getAllStations();
            res.status(200).json({
                status: 'success',
                results: stations.length,
                data: { stations },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const station = await station_service_1.StationService.createStation(req.body);
            res.status(201).json({
                status: 'success',
                data: { station },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.StationController = StationController;
exports.default = StationController;
