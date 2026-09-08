import { Clock, Info, Train, AlertCircle } from 'lucide-react';

export interface TrainSegment {
  trainNumber: string;
  trainName: string;
  fromStationCode: string;
  fromStationName: string;
  toStationCode: string;
  toStationName: string;
  departureTime: string; // e.g. "09:03 (Day 0)"
  arrivalTime: string;   // e.g. "14:53 (Day 0)"
  travelMinutes: number;
  cancellationProbability: number;
  averageDelayMinutes: number;
  actualDepartureDateTime?: string;
  actualArrivalDateTime?: string;
}

export interface Journey {
  departureStation: string;
  departureStationCode: string;
  destinationStation: string;
  destinationStationCode: string;
  departureTime: string;
  arrivalTime: string;
  totalTimeMinutes: number;
  travelTimeMinutes: number;
  waitingTimeMinutes: number;
  transferCount: number;
  reliabilityScore: number;
  overallScore: number;
  trainSegments: TrainSegment[];
  travelDate?: string;
  actualDepartureDateTime?: string;
  actualArrivalDateTime?: string;
  arrivalDay?: string;
  departureDay?: string;
}

interface JourneyTimelineProps {
  journey: Journey;
}

export default function JourneyTimeline({ journey }: JourneyTimelineProps) {
  // Convert delay to text description
  const getDelayText = (delay: number) => {
    if (delay === 0) return 'Usually on time';
    if (delay <= 10) return `Minor delays (~${delay}m)`;
    return `Prone to delays (~${delay}m)`;
  };

  // Convert delay to color
  const getDelayColor = (delay: number) => {
    if (delay === 0) return 'text-emerald-600';
    if (delay <= 15) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Timeline Legs */}
      <div className="relative border-l-2 border-slate-200 pl-6 ml-3 space-y-8">
        {journey.trainSegments.map((segment, idx) => {
          const isLast = idx === journey.trainSegments.length - 1;

          // Layover calculations if not last
          const hasLayover = !isLast;
          const nextSegment = journey.trainSegments[idx + 1];

          // Layover duration helper
          const calculateLayoverMinutes = () => {
            if (!hasLayover || !nextSegment) return 0;
            // Parse absolute times or do relative calculations
            // For mock/reconstructed data, we display total layover wait time or segment waiting time
            return journey.waitingTimeMinutes; // simple default fallback
          };

          return (
            <div key={idx} className="relative">
              {/* Outer timeline dot */}
              <div className="absolute -left-[31px] top-1 h-4 w-4 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center">
                <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
              </div>

              {/* Leg Segment Block */}
              <div className="bg-white rounded-lg border border-slate-100 p-4 shadow-sm flex flex-col gap-3">
                {/* Leg Header: Train Details */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Train className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Train {segment.trainNumber} - {segment.trainName}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    Duration: {segment.travelMinutes} mins
                  </span>
                </div>

                {/* Departure / Arrival Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Boarding Point */}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Board Train</span>
                    <span className="text-sm font-bold text-slate-800 mt-0.5">{segment.actualDepartureDateTime || segment.departureTime}</span>
                    <span className="text-xs font-medium text-slate-600 mt-0.5">
                      {segment.fromStationName} ({segment.fromStationCode})
                    </span>
                  </div>

                  {/* Alighting Point */}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Alight Train</span>
                    <span className="text-sm font-bold text-slate-800 mt-0.5">{segment.actualArrivalDateTime || segment.arrivalTime}</span>
                    <span className="text-xs font-medium text-slate-600 mt-0.5">
                      {segment.toStationName} ({segment.toStationCode})
                    </span>
                  </div>
                </div>

                {/* Reliability & Delays Leg Footer */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-50 pt-2 text-[10px] font-semibold text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className={getDelayColor(segment.averageDelayMinutes)}>
                      {getDelayText(segment.averageDelayMinutes)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-slate-400" />
                    <span>Cancellation Risk: {(segment.cancellationProbability * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Layover connecting info panel */}
              {hasLayover && nextSegment && (
                <div className="relative my-4 -ml-4 flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-100 text-[10px] font-bold text-amber-800 w-fit">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>
                    Transfer Connection Layover at {segment.toStationName} ({segment.toStationCode}) - Wait time ~{calculateLayoverMinutes()} mins
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary totals footer card */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs font-bold text-slate-700 flex flex-wrap justify-between gap-3">
        <div className="flex items-center gap-4">
          <span>Total Journey: {journey.totalTimeMinutes} minutes</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500 font-medium">In Motion: {journey.travelTimeMinutes}m</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500 font-medium">Layovers Wait: {journey.waitingTimeMinutes}m</span>
        </div>
        <div className="flex items-center gap-1 text-blue-700">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <span>Overall reliability index: {journey.reliabilityScore}%</span>
        </div>
      </div>
    </div>
  );
}
