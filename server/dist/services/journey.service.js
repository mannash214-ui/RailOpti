"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyService = void 0;
const journey_model_1 = require("../models/journey.model");
const error_1 = require("../middleware/error");
class JourneyService {
    /**
     * Fetch all journeys pinned/saved by a user.
     */
    static async getUserJourneys(userId) {
        return journey_model_1.Journey.find({ userId }).sort({ createdAt: -1 });
    }
    /**
     * Save an optimized itinerary to the user's account.
     */
    static async saveJourney(userId, journeyData) {
        const newJourney = await journey_model_1.Journey.create({
            userId,
            ...journeyData,
        });
        return newJourney;
    }
    /**
     * Deletes a saved journey. Checks ownership.
     */
    static async deleteJourney(userId, journeyId) {
        const journey = await journey_model_1.Journey.findById(journeyId);
        if (!journey) {
            throw new error_1.AppError('Journey not found.', 404);
        }
        // Verify ownership security
        if (journey.userId.toString() !== userId) {
            throw new error_1.AppError('You do not have permission to delete this journey.', 403);
        }
        await journey_model_1.Journey.findByIdAndDelete(journeyId);
    }
}
exports.JourneyService = JourneyService;
