import { PlannerConfig } from './PlannerConfig';

export class CostStrategy {
  private readonly config: PlannerConfig;

  constructor(config: PlannerConfig) {
    this.config = config;
  }

  /**
   * Compute edge/state cost based on parameterized travel metrics and configuration weights
   */
  public calculateCost(params: {
    travelMinutes: number;
    waitingMinutes: number;
    transfers: number;
    expectedDelay: number;
  }): number {
    return (
      this.config.travelWeight * params.travelMinutes +
      this.config.waitingWeight * params.waitingMinutes +
      this.config.transferPenalty * params.transfers +
      this.config.delayWeight * params.expectedDelay
    );
  }
}
