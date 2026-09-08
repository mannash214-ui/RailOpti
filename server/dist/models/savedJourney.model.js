"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedJourney = void 0;
const mongoose_1 = require("mongoose");
const savedJourneySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required.'],
    },
    departureStation: { type: String },
    departureStationCode: { type: String },
    destinationStation: { type: String },
    destinationStationCode: { type: String },
    departureTime: { type: String },
    arrivalTime: { type: String },
    totalTimeMinutes: { type: Number },
    travelTimeMinutes: { type: Number },
    waitingTimeMinutes: { type: Number },
    transferCount: { type: Number },
    reliabilityScore: { type: Number },
    overallScore: { type: Number },
    trainSegments: { type: mongoose_1.Schema.Types.Mixed },
    travelDate: { type: String },
    actualDepartureDateTime: { type: String },
    actualArrivalDateTime: { type: String },
    arrivalDay: { type: String },
    departureDay: { type: String },
}, {
    timestamps: true,
    strict: false,
});
// Indexes
savedJourneySchema.index({ userId: 1 });
exports.SavedJourney = (0, mongoose_1.model)('SavedJourney', savedJourneySchema);
exports.default = exports.SavedJourney;
