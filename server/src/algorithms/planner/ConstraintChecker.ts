import { PlannerConfig } from './PlannerConfig';

export class ConstraintChecker {
  private readonly config: PlannerConfig;

  constructor(config: PlannerConfig) {
    this.config = config;
  }

  /**
   * Validate if another transfer can be made within the maximum transfers limit
   */
  public canTransfer(currentTransfers: number): boolean {
    return currentTransfers < this.config.maximumTransfers;
  }

  /**
   * Validate transfer layover time constraint
   */
  public isValidTransferTime(minutes: number): boolean {
    return (
      minutes >= this.config.minimumTransferMinutes &&
      minutes <= this.config.maximumTransferMinutes
    );
  }

  /**
   * Helper to perform case-insensitive comparison of a train type against allowed train types
   */
  public static isTrainTypeAllowed(trainType: string, allowedTrainTypes: string[]): boolean {
    if (!allowedTrainTypes || allowedTrainTypes.length === 0) {
      return true;
    }
    const normalized = trainType.trim().toLowerCase();
    return allowedTrainTypes.some(type => type.trim().toLowerCase() === normalized);
  }

  /**
   * Validate train type is in the allowed list
   */
  public isAllowedTrainType(trainType: string): boolean {
    return ConstraintChecker.isTrainTypeAllowed(trainType, this.config.allowedTrainTypes);
  }

  /**
   * Validate total journey duration
   */
  public isValidJourneyDuration(startTime: number, currentTime: number): boolean {
    return (currentTime - startTime) <= this.config.maximumJourneyDurationMinutes;
  }

  /**
   * Validate arrival limit
   */
  public isValidArrival(currentTime: number): boolean {
    if (this.config.arrivalBeforeAbsoluteMinutes === undefined) {
      return true;
    }
    return currentTime <= this.config.arrivalBeforeAbsoluteMinutes;
  }

  /**
   * Validate accumulated wait time
   */
  public isValidWaiting(waitingTime: number): boolean {
    return waitingTime <= this.config.maximumWaitingMinutes;
  }

  /**
   * Validate if a transfer layover is not overnight (overlaps with [23:00, 05:00])
   */
  public isNotOvernightTransfer(arrivalMinutes: number, departureMinutes: number): boolean {
    if (!this.config.avoidOvernightTransfers) {
      return true;
    }
    const duration = departureMinutes - arrivalMinutes;
    if (duration >= 1440) {
      return false; // Spans full day, must overlap night
    }
    const arrMod = arrivalMinutes % 1440;
    const depMod = arrMod + duration;

    // Night intervals mod 1440:
    // [1380, 1740] (23:00 to 05:00 next day)
    // [-60, 300] (23:00 previous day to 05:00 same day)
    const overlapsNight1 = Math.max(arrMod, 1380) <= Math.min(depMod, 1740);
    const overlapsNight2 = Math.max(arrMod, -60) <= Math.min(depMod, 300);

    return !overlapsNight1 && !overlapsNight2;
  }
}
