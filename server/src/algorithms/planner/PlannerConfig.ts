export interface PlannerConfig {
  minimumTransferMinutes: number;
  maximumTransferMinutes: number;
  maximumTransfers: number;
  travelWeight: number;
  waitingWeight: number;
  transferPenalty: number;
  delayWeight: number;
  k: number;          // Top-K journeys count to collect
  costWindow: number; // Cost delta threshold above optimal to collect
  maximumWaitingMinutes: number;
  maximumJourneyDurationMinutes: number;
  allowedTrainTypes: string[];
  avoidOvernightTransfers: boolean;
  arrivalBeforeAbsoluteMinutes?: number;
}

export const DEFAULT_PLANNER_CONFIG: PlannerConfig = {
  minimumTransferMinutes: 20,
  maximumTransferMinutes: 1440, // 24 hours
  maximumTransfers: 3,
  travelWeight: 1.0,
  waitingWeight: 1.5,     // Waiting is usually perceived as worse than traveling
  transferPenalty: 30.0,  // Add 30 minutes of cost per transfer
  delayWeight: 0.5,       // Weight for average delay
  k: 5,
  costWindow: 300.0,
  maximumWaitingMinutes: Infinity,
  maximumJourneyDurationMinutes: Infinity,
  allowedTrainTypes: [],
  avoidOvernightTransfers: false,
};
