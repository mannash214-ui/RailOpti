"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedJourney = void 0;
const mongoose_1 = require("mongoose");
const types_1 = require("./types");
const savedJourneySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required.'],
    },
    sourceStation: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Station',
        required: [true, 'Source station reference is required.'],
    },
    destinationStation: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Station',
        required: [true, 'Destination station reference is required.'],
    },
    optimizationMode: {
        type: String,
        required: [true, 'Optimization mode filter is required.'],
        enum: {
            values: Object.values(types_1.OptimizationMode),
            message: '{VALUE} is not a valid optimization mode.',
        },
    },
}, {
    timestamps: true,
});
// Indexes
savedJourneySchema.index({ userId: 1 });
savedJourneySchema.index({ sourceStation: 1 });
savedJourneySchema.index({ destinationStation: 1 });
exports.SavedJourney = (0, mongoose_1.model)('SavedJourney', savedJourneySchema);
exports.default = exports.SavedJourney;
