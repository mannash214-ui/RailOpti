"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PLANNER_CONFIG = void 0;
exports.DEFAULT_PLANNER_CONFIG = {
    minimumTransferMinutes: 20,
    maximumTransferMinutes: 1440, // 24 hours
    maximumTransfers: 3,
    travelWeight: 1.0,
    waitingWeight: 1.5, // Waiting is usually perceived as worse than traveling
    transferPenalty: 30.0, // Add 30 minutes of cost per transfer
    delayWeight: 0.5, // Weight for average delay
    k: 5,
    costWindow: 300.0,
    maximumWaitingMinutes: Infinity,
    maximumJourneyDurationMinutes: Infinity,
    allowedTrainTypes: [],
    avoidOvernightTransfers: false,
};
