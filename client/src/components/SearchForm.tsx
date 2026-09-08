import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, RotateCcw, Loader2 } from 'lucide-react';
import stationService, { StationData } from '../services/stationService';

interface SearchFormProps {
  initialValues?: {
    sourceStation?: string;
    destinationStation?: string;
    travelDate?: string;
    departureAfter?: string;
    arrivalBefore?: string;
    optimizationMode?: string;
    maximumTransfers?: number;
    minimumTransferMinutes?: number;
    maximumWaitingMinutes?: number;
    maximumJourneyDurationMinutes?: number;
    allowedTrainTypes?: string[];
    avoidOvernightTransfers?: boolean;
  };
  onSearchSubmit?: (values: any) => void;
}

export default function SearchForm({ initialValues, onSearchSubmit }: SearchFormProps) {
  const navigate = useNavigate();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Core fields
  const [source, setSource] = useState(initialValues?.sourceStation || '');
  const [destination, setDestination] = useState(initialValues?.destinationStation || '');
  const [travelDate, setTravelDate] = useState(initialValues?.travelDate || getTodayDateString());
  const [departureTime, setDepartureTime] = useState(initialValues?.departureAfter || '08:00');
  const [arrivalBefore, setArrivalBefore] = useState(initialValues?.arrivalBefore || '');
  const [optimizationMode, setOptimizationMode] = useState(initialValues?.optimizationMode || 'BALANCED');

  // Constraints
  const [maxTransfers, setMaxTransfers] = useState(initialValues?.maximumTransfers !== undefined ? initialValues.maximumTransfers : 2);
  const [minTransferTime, setMinTransferTime] = useState(initialValues?.minimumTransferMinutes || 20);
  const [maxWaitTime, setMaxWaitTime] = useState(initialValues?.maximumWaitingMinutes || 1440);
  const [maxDuration, setMaxDuration] = useState(initialValues?.maximumJourneyDurationMinutes || 1440);
  const [avoidOvernight, setAvoidOvernight] = useState(initialValues?.avoidOvernightTransfers || false);
  const [selectedTrainTypes, setSelectedTrainTypes] = useState<string[]>(initialValues?.allowedTrainTypes || []);

  // Autocomplete states
  const [sourceSuggestions, setSourceSuggestions] = useState<StationData[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<StationData[]>([]);
  const [loadingSource, setLoadingSource] = useState(false);
  const [loadingDest, setLoadingDest] = useState(false);
  const [ignoreSourceQuery, setIgnoreSourceQuery] = useState(false);
  const [ignoreDestQuery, setIgnoreDestQuery] = useState(false);

  // Debouncing effect for source
  useEffect(() => {
    if (!source || source.length < 2) {
      setSourceSuggestions([]);
      return;
    }
    if (ignoreSourceQuery) {
      setIgnoreSourceQuery(false);
      return;
    }

    const controller = new AbortController();
    setLoadingSource(true);

    const timer = setTimeout(async () => {
      try {
        const results = await stationService.search(source, controller.signal);
        setSourceSuggestions(results);
      } catch (err) {
        // Silent AbortError
      } finally {
        setLoadingSource(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [source]);

  // Debouncing effect for destination
  useEffect(() => {
    if (!destination || destination.length < 2) {
      setDestSuggestions([]);
      return;
    }
    if (ignoreDestQuery) {
      setIgnoreDestQuery(false);
      return;
    }

    const controller = new AbortController();
    setLoadingDest(true);

    const timer = setTimeout(async () => {
      try {
        const results = await stationService.search(destination, controller.signal);
        setDestSuggestions(results);
      } catch (err) {
        // Silent AbortError
      } finally {
        setLoadingDest(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [destination]);

  const handleSelectSource = (station: StationData) => {
    setIgnoreSourceQuery(true);
    setSource(station.name);
    setSourceSuggestions([]);
  };

  const handleSelectDest = (station: StationData) => {
    setIgnoreDestQuery(true);
    setDestination(station.name);
    setDestSuggestions([]);
  };

  const trainTypes = ['Shatabdi', 'Rajdhani', 'Superfast', 'Express', 'Vande Bharat', 'Passenger'];

  const toggleTrainType = (type: string) => {
    setSelectedTrainTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !destination) return;

    const queryData = {
      sourceStation: source,
      destinationStation: destination,
      travelDate: travelDate,
      departureAfter: departureTime,
      arrivalBefore: arrivalBefore || undefined,
      optimizationMode,
      maximumTransfers: maxTransfers,
      minimumTransferMinutes: minTransferTime,
      maximumWaitingMinutes: maxWaitTime,
      maximumJourneyDurationMinutes: maxDuration,
      allowedTrainTypes: selectedTrainTypes.length > 0 ? selectedTrainTypes : undefined,
      avoidOvernightTransfers: avoidOvernight,
    };

    if (onSearchSubmit) {
      onSearchSubmit(queryData);
    } else {
      // Build query string params and navigate
      const params = new URLSearchParams();
      Object.entries(queryData).forEach(([key, val]) => {
        if (val !== undefined && val !== '') {
          if (Array.isArray(val)) {
            params.set(key, val.join(','));
          } else {
            params.set(key, String(val));
          }
        }
      });
      navigate(`/search?${params.toString()}`);
    }
  };

  const handleReset = () => {
    setSource('');
    setDestination('');
    setTravelDate(getTodayDateString());
    setDepartureTime('08:00');
    setArrivalBefore('');
    setOptimizationMode('BALANCED');
    setMaxTransfers(2);
    setMinTransferTime(20);
    setMaxWaitTime(1440);
    setMaxDuration(1440);
    setAvoidOvernight(false);
    setSelectedTrainTypes([]);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white rounded-xl shadow-md border border-slate-200 p-6 flex flex-col gap-6">
      {/* Search Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">Route Selection</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={optimizationMode}
            onChange={(e) => setOptimizationMode(e.target.value)}
            className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-transparent rounded-full px-3 py-1.5 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="BALANCED">Balanced Choice</option>
            <option value="FASTEST">Fastest Journey</option>
            <option value="LEAST_TRANSFERS">Fewest Transfers</option>
            <option value="MOST_RELIABLE">Highest Reliability</option>
          </select>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 border transition-all ${
              showAdvanced || selectedTrainTypes.length > 0 || avoidOvernight
                ? 'bg-slate-100 text-slate-800 border-slate-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Search Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Origin Input */}
        <div className="md:col-span-3 relative">
          <input
            type="text"
            placeholder="From (e.g. Silchar)"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            required
            className="w-full google-input pr-10"
          />
          {loadingSource && (
            <div className="absolute right-3 top-3.5 flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            </div>
          )}
          {sourceSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-[48px] bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {sourceSuggestions.map((station) => (
                <button
                  key={station._id}
                  type="button"
                  onClick={() => handleSelectSource(station)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs text-slate-800 font-medium flex items-center justify-between border-b border-slate-100 last:border-b-0"
                >
                  <span>{station.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{station.stationCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center">
          <button
            type="button"
            onClick={handleSwap}
            className="p-2 hover:bg-slate-100 border border-slate-200 rounded-full text-slate-500 hover:text-slate-900 transition-colors shadow-sm"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="h-4 w-4 rotate-90 md:rotate-0" />
          </button>
        </div>

        {/* Destination Input */}
        <div className="md:col-span-3 relative">
          <input
            type="text"
            placeholder="To (e.g. Patna)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            className="w-full google-input pr-10"
          />
          {loadingDest && (
            <div className="absolute right-3 top-3.5 flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            </div>
          )}
          {destSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-[48px] bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {destSuggestions.map((station) => (
                <button
                  key={station._id}
                  type="button"
                  onClick={() => handleSelectDest(station)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs text-slate-800 font-medium flex items-center justify-between border-b border-slate-100 last:border-b-0"
                >
                  <span>{station.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{station.stationCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Journey Date */}
        <div className="md:col-span-3">
          <input
            type="date"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            required
            className="w-full google-input text-center"
            title="Journey Date"
          />
        </div>

        {/* Departure Time */}
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Departure (e.g. 08:00)"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            required
            className="w-full google-input text-center"
            title="Format: HH:mm"
          />
        </div>
      </div>

      {/* Advanced Filters Expandable Drawer */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 animate-fadeIn">
          {/* Column 1: Core Bounds */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Duration & Layovers</h4>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Max Transfers</label>
              <select
                value={maxTransfers}
                onChange={(e) => setMaxTransfers(parseInt(e.target.value, 10))}
                className="google-input py-2 text-xs"
              >
                <option value={0}>Direct trains only</option>
                <option value={1}>Max 1 transfer</option>
                <option value={2}>Max 2 transfers</option>
                <option value={3}>Max 3 transfers</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Max Wait Per Layover (minutes)</label>
              <input
                type="number"
                value={maxWaitTime}
                onChange={(e) => setMaxWaitTime(parseInt(e.target.value, 10) || 1440)}
                className="google-input py-2 text-xs"
              />
            </div>
          </div>

          {/* Column 2: Additional Times */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Arrival Constraints</h4>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Must Arrive Before (HH:mm)</label>
              <input
                type="text"
                placeholder="Optional e.g. 18:00"
                value={arrivalBefore}
                onChange={(e) => setArrivalBefore(e.target.value)}
                className="google-input py-2 text-xs text-center"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Max Journey Duration (minutes)</label>
              <input
                type="number"
                value={maxDuration}
                onChange={(e) => setMaxDuration(parseInt(e.target.value, 10) || 1440)}
                className="google-input py-2 text-xs"
              />
            </div>
          </div>

          {/* Column 3: Rules & Trains */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Train Classification & Overnight</h4>

            <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800">Avoid Overnight Layovers</span>
                <span className="text-[10px] text-slate-400">No waits across calendar days</span>
              </div>
              <input
                type="checkbox"
                checked={avoidOvernight}
                onChange={(e) => setAvoidOvernight(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-600">Permitted Train Types</span>
              <div className="flex flex-wrap gap-1.5">
                {trainTypes.map((type) => {
                  const isSelected = selectedTrainTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleTrainType(type)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-full border transition-all ${
                        isSelected
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
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
        </div>
      )}

      {/* Submit / Reset Actions Row */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2 transition-colors rounded-lg"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Clear form</span>
        </button>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-blue-500/10 transition-colors"
        >
          <Search className="h-4 w-4" />
          <span>Search Journeys</span>
        </button>
      </div>
    </form>
  );
}
