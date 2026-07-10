import { TrainSegment } from './PlannerTypes';

export class ReliabilityCalculator {
  /**
   * Compute normalized reliability score (0-100) based on segment cancellations and delays
   */
  public static calculate(segments: TrainSegment[]): number {
    if (segments.length === 0) {
      return 100;
    }

    let successProbability = 1.0;
    let totalDelay = 0;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      // Probability of no cancellation on this segment
      successProbability *= (1.0 - segment.cancellationProbability);
      totalDelay += segment.averageDelayMinutes;
    }

    // Delay penalty factor: exponential decay where 45 minutes of delay halves the factor (or similar smooth curve)
    const delayFactor = Math.exp(-totalDelay / 45);

    // Compute normalized score 0 - 100
    const score = 100.0 * successProbability * delayFactor;

    // Return rounded score bound between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
