import { Journey } from './PlannerTypes';
import { OptimizationMode } from '../../models/types';

export class JourneyRanker {
  /**
   * Sort journeys based on the chosen optimization mode and calculate overallScores (0-100)
   */
  public static rank(journeys: Journey[], mode: OptimizationMode): Journey[] {
    if (journeys.length === 0) {
      return [];
    }
    if (journeys.length === 1) {
      journeys[0].overallScore = 100;
      return journeys;
    }

    // 1. Calculate raw objective cost values for each journey based on mode
    const rawObjectives = journeys.map((j) => {
      let objective = 0;
      switch (mode) {
        case OptimizationMode.FASTEST:
          objective = j.totalTimeMinutes;
          break;
        case OptimizationMode.LEAST_TRANSFERS:
          // Heavily penalize transfers to keep transfer count minimal
          objective = j.transferCount * 5000 + j.totalTimeMinutes;
          break;
        case OptimizationMode.MOST_RELIABLE:
          // Reliability is 0 to 100 (higher is better). Subtract from 100 to make lower cost better
          objective = (100.0 - j.reliabilityScore) * 1000 + j.totalTimeMinutes;
          break;
        case OptimizationMode.BALANCED:
        default:
          // Balanced cost: mix of duration, transfers, and reliability
          objective = j.totalTimeMinutes * 1.0 + j.transferCount * 45.0 + (100.0 - j.reliabilityScore) * 2.0;
          break;
      }
      return { journey: j, objective };
    });

    // 2. Determine min (best) and max (worst) objectives for normalization
    let minObj = Infinity;
    let maxObj = -Infinity;
    for (let i = 0; i < rawObjectives.length; i++) {
      const obj = rawObjectives[i].objective;
      if (obj < minObj) minObj = obj;
      if (obj > maxObj) maxObj = obj;
    }

    // 3. Normalize objective values into overallScore (0-100)
    const objRange = maxObj - minObj;
    const ranked = rawObjectives.map((ro) => {
      let score = 100;
      if (objRange > 0) {
        // Linear normalization: min objective gets 100, max objective gets 30 (to avoid 0 score if alternative is still reasonable)
        const normalized = (ro.objective - minObj) / objRange;
        score = Math.round(100 - 70 * normalized);
      }
      ro.journey.overallScore = Math.max(0, Math.min(100, score));
      return ro.journey;
    });

    // 4. Sort journeys by overallScore descending, then by duration ascending
    return ranked.sort((a, b) => {
      if (b.overallScore !== a.overallScore) {
        return b.overallScore - a.overallScore;
      }
      return a.totalTimeMinutes - b.totalTimeMinutes;
    });
  }
}
