export interface TrainSegment {
  trainNumber: string;
  trainName: string;
  fromStationCode: string;
  fromStationName: string;
  toStationCode: string;
  toStationName: string;
  departureTime: string; // Format: "HH:mm (Day X)"
  arrivalTime: string;   // Format: "HH:mm (Day X)"
  travelMinutes: number;
  cancellationProbability: number;
  averageDelayMinutes: number;
}

export interface Journey {
  departureStation: string;
  departureStationCode: string;
  destinationStation: string;
  destinationStationCode: string;
  departureTime: string; // Format: "HH:mm (Day X)"
  arrivalTime: string;   // Format: "HH:mm (Day X)"
  totalTimeMinutes: number;
  travelTimeMinutes: number;
  waitingTimeMinutes: number;
  transferCount: number;
  reliabilityScore: number;
  overallScore: number;
  trainSegments: TrainSegment[];
}

export interface SearchState {
  nodeId: string;
  transfersUsed: number;
  currentTime: number;
  currentTrainId: string;
  accumulatedCost: number;
  accumulatedWaiting: number;
}

export interface SearchRequest {
  sourceStation: string;
  destinationStation: string;
  departureAfter: string; // Format: "HH:mm"
  arrivalBefore?: string; // Format: "HH:mm" (optional)
  optimizationMode?: string; // Matches OptimizationMode enum
  maximumTransfers?: number;
  minimumTransferMinutes?: number;
  maximumWaitingMinutes?: number;
  maximumJourneyDurationMinutes?: number;
  allowedTrainTypes?: string[];
  avoidOvernightTransfers?: boolean;
}

/**
 * Format absolute minutes from Day 0, 00:00 to HH:mm (Day X)
 */
export function formatMinutesToTime(totalMinutes: number): string {
  const day = Math.floor(totalMinutes / 1440);
  const remainingMinutes = totalMinutes % 1440;
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  return `Day ${day} ${timeStr}`;
}
