"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostStrategy = void 0;
class CostStrategy {
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Compute edge/state cost based on parameterized travel metrics and configuration weights
     */
    calculateCost(params) {
        return (this.config.travelWeight * params.travelMinutes +
            this.config.waitingWeight * params.waitingMinutes +
            this.config.transferPenalty * params.transfers +
            this.config.delayWeight * params.expectedDelay);
    }
}
exports.CostStrategy = CostStrategy;
