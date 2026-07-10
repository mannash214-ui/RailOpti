"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstraintChecker = void 0;
class ConstraintChecker {
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Validate if another transfer can be made within the maximum transfers limit
     */
    canTransfer(currentTransfers) {
        return currentTransfers < this.config.maximumTransfers;
    }
    /**
     * Validate transfer layover time constraint
     */
    isValidTransferTime(minutes) {
        return (minutes >= this.config.minimumTransferMinutes &&
            minutes <= this.config.maximumTransferMinutes);
    }
    /**
     * Helper to perform case-insensitive comparison of a train type against allowed train types
     */
    static isTrainTypeAllowed(trainType, allowedTrainTypes) {
        if (!allowedTrainTypes || allowedTrainTypes.length === 0) {
            return true;
        }
        const normalized = trainType.trim().toLowerCase();
        return allowedTrainTypes.some(type => type.trim().toLowerCase() === normalized);
    }
    /**
     * Validate train type is in the allowed list
     */
    isAllowedTrainType(trainType) {
        return ConstraintChecker.isTrainTypeAllowed(trainType, this.config.allowedTrainTypes);
    }
    /**
     * Validate total journey duration
     */
    isValidJourneyDuration(startTime, currentTime) {
        return (currentTime - startTime) <= this.config.maximumJourneyDurationMinutes;
    }
    /**
     * Validate arrival limit
     */
    isValidArrival(currentTime) {
        if (this.config.arrivalBeforeAbsoluteMinutes === undefined) {
            return true;
        }
        return currentTime <= this.config.arrivalBeforeAbsoluteMinutes;
    }
    /**
     * Validate accumulated wait time
     */
    isValidWaiting(waitingTime) {
        return waitingTime <= this.config.maximumWaitingMinutes;
    }
    /**
     * Validate if a transfer layover is not overnight (overlaps with [23:00, 05:00])
     */
    isNotOvernightTransfer(arrivalMinutes, departureMinutes) {
        if (!this.config.avoidOvernightTransfers) {
            return true;
        }
        const arrivalDay = Math.floor(arrivalMinutes / 1440);
        const departureDay = Math.floor(departureMinutes / 1440);
        return arrivalDay === departureDay;
    }
}
exports.ConstraintChecker = ConstraintChecker;
