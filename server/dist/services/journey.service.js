"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyService = void 0;
const savedJourney_model_1 = require("../models/savedJourney.model");
const error_1 = require("../middleware/error");
class JourneyService {
    /**
     * Fetch all journeys pinned/saved by a user.
     */
    static async getUserJourneys(userId) {
        return savedJourney_model_1.SavedJourney.find({ userId }).sort({ createdAt: -1 });
    }
    /**
     * Save an optimized itinerary to the user's account.
     */
    static async saveJourney(userId, journeyData) {
        const newJourney = await savedJourney_model_1.SavedJourney.create({
            userId,
            ...journeyData,
        });
        return newJourney;
    }
    /**
     * Deletes a saved journey. Checks ownership.
     */
    static async deleteJourney(userId, journeyId) {
        const journey = await savedJourney_model_1.SavedJourney.findById(journeyId);
        if (!journey) {
            throw new error_1.AppError('Journey not found.', 404);
        }
        // Verify ownership security
        if (journey.userId.toString() !== userId) {
            throw new error_1.AppError('You do not have permission to delete this journey.', 403);
        }
        await savedJourney_model_1.SavedJourney.findByIdAndDelete(journeyId);
    }
}
exports.JourneyService = JourneyService;
