import { useState, useEffect } from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
  onFiltersChange: (filters: {
    maxTransfers: number;
    maxWaitingMinutes: number;
    minReliability: number;
    avoidOvernightTransfers: boolean;
    allowedTrainTypes: string[];
  }) => void;
  initialValues?: {
    maxTransfers?: number;
    maxWaitingMinutes?: number;
    minReliability?: number;
    avoidOvernightTransfers?: boolean;
    allowedTrainTypes?: string[];
  };
}

export default function FilterSidebar({ onFiltersChange, initialValues }: FilterSidebarProps) {
  const [maxTransfers, setMaxTransfers] = useState(initialValues?.maxTransfers !== undefined ? initialValues.maxTransfers : 2);
  const [maxWaiting, setMaxWaiting] = useState(initialValues?.maxWaitingMinutes || 1440);
  const [minReliability, setMinReliability] = useState(initialValues?.minReliability || 30);
  const [avoidOvernight, setAvoidOvernight] = useState(initialValues?.avoidOvernightTransfers || false);
  const [selectedTrainTypes, setSelectedTrainTypes] = useState<string[]>(initialValues?.allowedTrainTypes || []);

  const trainTypes = ['Shatabdi', 'Rajdhani', 'Superfast', 'Express', 'Vande Bharat', 'Passenger'];

  const toggleTrainType = (type: string) => {
    setSelectedTrainTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Trigger callback when filters change
  useEffect(() => {
    onFiltersChange({
      maxTransfers,
      maxWaitingMinutes: maxWaiting,
      minReliability,
      avoidOvernightTransfers: avoidOvernight,
      allowedTrainTypes: selectedTrainTypes,
    });
  }, [maxTransfers, maxWaiting, minReliability, avoidOvernight, selectedTrainTypes]);

  const handleReset = () => {
    setMaxTransfers(2);
    setMaxWaiting(1440);
    setMinReliability(30);
    setAvoidOvernight(false);
    setSelectedTrainTypes([]);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-bold text-slate-800">Filter Itineraries</span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* Transfer filter options */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-700">Layovers</span>
        <div className="flex flex-col gap-1.5">
          {[
            { label: 'Direct trains only', value: 0 },
            { label: 'Max 1 transfer', value: 1 },
            { label: 'Max 2 transfers', value: 2 },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="radio"
                name="transfers"
                checked={maxTransfers === option.value}
                onChange={() => setMaxTransfers(option.value)}
                className="h-3.5 w-3.5 border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Waiting minutes limit slider */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
          <span>Max Wait Time</span>
          <span className="text-blue-600 font-semibold">{maxWaiting === 1440 ? 'Any duration' : `${maxWaiting} mins`}</span>
        </div>
        <input
          type="range"
          min={20}
          max={480}
          step={10}
          value={maxWaiting}
          onChange={(e) => setMaxWaiting(parseInt(e.target.value, 10))}
          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-[9px] text-slate-400 font-bold">
          <span>20m</span>
          <span>480m</span>
        </div>
      </div>

      {/* Reliability limit slider */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
          <span>Min Reliability</span>
          <span className="text-emerald-600 font-semibold">{minReliability}%</span>
        </div>
        <input
          type="range"
          min={20}
          max={90}
          step={5}
          value={minReliability}
          onChange={(e) => setMinReliability(parseInt(e.target.value, 10))}
          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-[9px] text-slate-400 font-bold">
          <span>20%</span>
          <span>90%</span>
        </div>
      </div>

      {/* Overnight checkbox */}
      <div className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg border border-slate-100">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-700">Avoid Overnight Layovers</span>
          <span className="text-[9px] text-slate-400">Filter out midnight wait times</span>
        </div>
        <input
          type="checkbox"
          checked={avoidOvernight}
          onChange={(e) => setAvoidOvernight(e.target.checked)}
          className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </div>

      {/* Train classifications */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-700">Train Categories</span>
        <div className="grid grid-cols-2 gap-2">
          {trainTypes.map((type) => {
            const isSelected = selectedTrainTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleTrainType(type)}
                className={`text-[10px] font-bold py-1.5 px-2 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
