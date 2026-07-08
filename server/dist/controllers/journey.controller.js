"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyController = void 0;
const journey_service_1 = require("../services/journey.service");
const error_1 = require("../middleware/error");
class JourneyController {
    static async getUserJourneys(req, res, next) {
        try {
            if (!req.user?.id) {
                return next(new error_1.AppError('Unauthorized: Missing user information.', 401));
            }
            const journeys = await journey_service_1.JourneyService.getUserJourneys(req.user.id);
            res.status(200).json({
                status: 'success',
                results: journeys.length,
                data: { journeys },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async save(req, res, next) {
        try {
            if (!req.user?.id) {
                return next(new error_1.AppError('Unauthorized: Missing user information.', 401));
            }
            const journey = await journey_service_1.JourneyService.saveJourney(req.user.id, req.body);
            res.status(201).json({
                status: 'success',
                data: { journey },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            if (!req.user?.id) {
                return next(new error_1.AppError('Unauthorized: Missing user information.', 401));
            }
            await journey_service_1.JourneyService.deleteJourney(req.user.id, req.params.id);
            res.status(204).json({
                status: 'success',
                data: null,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.JourneyController = JourneyController;
exports.default = JourneyController;
