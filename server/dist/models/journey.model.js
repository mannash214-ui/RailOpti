"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Journey = void 0;
const mongoose_1 = require("mongoose");
const routeLegSchema = new mongoose_1.Schema({
    trainNumber: {
        type: String,
        required: true,
    },
    origin: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    departureTime: {
        type: String,
        required: true,
    },
    arrivalTime: {
        type: String,
        required: true,
    },
});
const journeySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A saved journey must belong to an authenticated user.'],
    },
    originStation: {
        type: String,
        required: [true, 'Origin station is required.'],
    },
    destinationStation: {
        type: String,
        required: [true, 'Destination station is required.'],
    },
    totalDuration: {
        type: String,
        required: true,
    },
    transfersCount: {
        type: Number,
        required: true,
    },
    avgWaitingTimeMins: {
        type: Number,
        required: true,
    },
    reliabilityIndex: {
        type: Number,
        required: true,
    },
    legs: [routeLegSchema],
}, {
    timestamps: true,
});
// Optimize retrieval of saved journeys for a particular user
journeySchema.index({ userId: 1 });
exports.Journey = (0, mongoose_1.model)('Journey', journeySchema);
exports.default = exports.Journey;
