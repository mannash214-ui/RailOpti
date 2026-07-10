import { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { Journey } from './JourneyTimeline'; // We will define this type in JourneyTimeline
import JourneyTimeline from './JourneyTimeline';

interface JourneyCardProps {
  journey: Journey;
  onSave?: (journey: Journey) => void;
  isSaved?: boolean;
}

export default function JourneyCard({ journey, onSave, isSaved = false }: JourneyCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Helper to determine reliability badge styling
  const getReliabilityColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 60) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  // Convert time formatting Day X YY:mm to readable
  const formatTime = (timeStr: string) => {
    return timeStr.replace(/Day \d+ /, '');
  };

  return (
    <div className="google-card overflow-hidden">
      {/* Primary Row */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex-grow flex flex-col md:flex-row md:items-center gap-6">
          {/* Timeline Summary */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-800">{formatTime(journey.departureTime)}</span>
              <span className="text-xs text-slate-400 font-semibold text-center mt-0.5">{journey.departureStationCode}</span>
            </div>
            
            <div className="flex flex-col items-center min-w-[80px] sm:min-w-[120px] relative px-2">
              <span className="text-[10px] text-slate-400 font-medium">{journey.totalTimeMinutes} min</span>
              <div className="w-full h-0.5 bg-slate-200 relative my-1">
                {/* Transfer dots */}
                {journey.transferCount > 0 && (
                  <div className="absolute inset-0 flex justify-around items-center">
                    {Array.from({ length: journey.transferCount }).map((_, i) => (
                      <span key={i} className="h-1.5 w-1.5 bg-amber-500 rounded-full border border-white" title={`${journey.transferCount} transfer(s)`} />
                    ))}
                  </div>
                )}
              </div>
              <span className={`text-[9px] font-bold ${journey.transferCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {journey.transferCount === 0 ? 'nonstop' : `${journey.transferCount} transfer(s)`}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-800">{formatTime(journey.arrivalTime)}</span>
              <span className="text-xs text-slate-400 font-semibold text-center mt-0.5">{journey.destinationStationCode}</span>
            </div>
          </div>

          {/* Trains summary */}
          <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
            {journey.trainSegments.map((segment, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 rounded px-2 py-0.5">
                <span className="font-bold text-slate-700">{segment.trainNumber}</span>
                <span className="text-[9px] font-normal text-slate-400">({segment.fromStationCode}→{segment.toStationCode})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Scores, Badges, and Expand Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-6 flex-shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          {/* Reliability Score Badge */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${getReliabilityColor(journey.reliabilityScore)}`}>
            <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{journey.reliabilityScore}% reliable</span>
          </div>

          {/* Rank Overall Score */}
          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium block">Rank Score</span>
            <span className="text-lg font-extrabold text-blue-600">{journey.overallScore}/100</span>
          </div>

          {/* Details Toggle Button */}
          <div className="flex items-center gap-1">
            {onSave && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(journey);
                }}
                className={`p-2 rounded-lg border transition-colors ${
                  isSaved
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 border-slate-200'
                }`}
                title={isSaved ? 'Saved to itinerary list' : 'Save itinerary'}
              >
                <Star className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
            <button
              type="button"
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Accordion: Detailed Timeline */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-6 animate-fadeIn">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Journey Details & Timeline</h4>
          <JourneyTimeline journey={journey} />
        </div>
      )}
    </div>
  );
}
