import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Train } from 'lucide-react';
import SearchForm from '../components/SearchForm';
import FilterSidebar from '../components/FilterSidebar';
import JourneyCard from '../components/JourneyCard';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import { Journey } from '../components/JourneyTimeline';
import journeyService from '../services/journeyService';



export default function Search() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [rawJourneys, setRawJourneys] = useState<Journey[]>([]);
  const [filteredJourneys, setFilteredJourneys] = useState<Journey[]>([]);
  const [savedJourneyIds, setSavedJourneyIds] = useState<string[]>([]);

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Parse parameters from URL
  const origin = searchParams.get('sourceStation') || '';
  const destination = searchParams.get('destinationStation') || '';
  const travelDate = searchParams.get('travelDate') || getTodayDateString();
  const departureAfter = searchParams.get('departureAfter') || '';
  const optimizationMode = searchParams.get('optimizationMode') || 'BALANCED';

  const arrivalBefore = searchParams.get('arrivalBefore') || undefined;
  const maximumTransfers = searchParams.get('maximumTransfers') ? Number(searchParams.get('maximumTransfers')) : undefined;
  const minimumTransferMinutes = searchParams.get('minimumTransferMinutes') ? Number(searchParams.get('minimumTransferMinutes')) : undefined;
  const maximumWaitingMinutes = searchParams.get('maximumWaitingMinutes') ? Number(searchParams.get('maximumWaitingMinutes')) : undefined;
  const maximumJourneyDurationMinutes = searchParams.get('maximumJourneyDurationMinutes') ? Number(searchParams.get('maximumJourneyDurationMinutes')) : undefined;
  const allowedTrainTypes = searchParams.get('allowedTrainTypes') ? searchParams.get('allowedTrainTypes')?.split(',') : undefined;
  const avoidOvernightTransfers = searchParams.get('avoidOvernightTransfers') === 'true';

  // Load saved lists
  useEffect(() => {
    const saved = localStorage.getItem('optirail_saved');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedJourneyIds(parsed.map((j: any) => `${j.departureTime}-${j.arrivalTime}-${j.totalTimeMinutes}`));
      } catch (e) {
        // Silent
      }
    }
  }, []);

  const [errorMessage, setErrorMessage] = useState<string>('');

  const executeSearchQuery = async () => {
    if (!origin || !destination) return;

    setLoading(true);
    setError(false);
    setErrorMessage('');

    try {
      const results = await journeyService.search({
        sourceStation: origin,
        destinationStation: destination,
        travelDate: travelDate,
        departureAfter: departureAfter || '08:00',
        arrivalBefore,
        optimizationMode,
        maximumTransfers,
        minimumTransferMinutes,
        maximumWaitingMinutes,
        maximumJourneyDurationMinutes,
        allowedTrainTypes,
        avoidOvernightTransfers,
      });

      setRawJourneys(results);
      setFilteredJourneys(results);
    } catch (err: any) {
      console.error('[Search] Failed to fetch journeys from backend:', err);
      const apiMsg = err?.response?.data?.message || err?.message || 'Failed to calculate routing itineraries. Please check station names and search constraints.';
      setErrorMessage(apiMsg);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Run search query when URL parameters update
  useEffect(() => {
    executeSearchQuery();
  }, [
    origin,
    destination,
    travelDate,
    departureAfter,
    arrivalBefore,
    optimizationMode,
    maximumTransfers,
    minimumTransferMinutes,
    maximumWaitingMinutes,
    maximumJourneyDurationMinutes,
    allowedTrainTypes?.join(','),
    avoidOvernightTransfers,
  ]);

  const handleFilterChange = (filters: {
    maxTransfers: number;
    maxWaitingMinutes: number;
    minReliability: number;
    avoidOvernightTransfers: boolean;
    allowedTrainTypes: string[];
  }) => {
    let result = [...rawJourneys];

    // 1. Filter by transfers
    result = result.filter(j => j.transferCount <= filters.maxTransfers);

    // 2. Filter by max waiting time
    result = result.filter(j => j.waitingTimeMinutes <= filters.maxWaitingMinutes);

    // 3. Filter by min reliability
    result = result.filter(j => j.reliabilityScore >= filters.minReliability);

    // 4. Filter by overnight transfers calendar days
    if (filters.avoidOvernightTransfers) {
      result = result.filter(j => {
        // check each transfer segment
        return j.trainSegments.every((seg, idx) => {
          if (idx === j.trainSegments.length - 1) return true;
          const nextSeg = j.trainSegments[idx + 1];
          const arrDay = parseInt(seg.arrivalTime.match(/Day (\d+)/)?.[1] || '0', 10);
          const depDay = parseInt(nextSeg.departureTime.match(/Day (\d+)/)?.[1] || '0', 10);
          return arrDay === depDay; // same calendar day
        });
      });
    }

    // 5. Filter by allowed train types
    if (filters.allowedTrainTypes.length > 0) {
      result = result.filter(j => {
        return j.trainSegments.every(seg => {
          return filters.allowedTrainTypes.some(type =>
            seg.trainName.toLowerCase().includes(type.toLowerCase()) ||
            seg.trainNumber.toLowerCase().includes(type.toLowerCase())
          );
        });
      });
    }

    setFilteredJourneys(result);
  };

  const handleSaveJourney = async (journey: Journey) => {
    const key = `${journey.departureTime}-${journey.arrivalTime}-${journey.totalTimeMinutes}`;
    const token = localStorage.getItem('optirail_token');

    if (savedJourneyIds.includes(key)) {
      setSavedJourneyIds((prev) => prev.filter((k) => k !== key));
    } else {
      setSavedJourneyIds((prev) => [...prev, key]);
      if (token) {
        try {
          await journeyService.save(journey);
        } catch (err) {
          console.error('[Search] Failed to save journey to MongoDB:', err);
        }
      }
    }

    let saved = localStorage.getItem('optirail_saved');
    let list = saved ? JSON.parse(saved) : [];
    if (savedJourneyIds.includes(key)) {
      list = list.filter((j: any) => `${j.departureTime}-${j.arrivalTime}-${j.totalTimeMinutes}` !== key);
    } else {
      list.push(journey);
    }
    localStorage.setItem('optirail_saved', JSON.stringify(list));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-6">
      {/* Search Bar header panel */}
      <div className="google-card p-4">
        <SearchForm
          initialValues={{
            sourceStation: origin,
            destinationStation: destination,
            travelDate: travelDate,
            departureAfter: departureAfter,
            arrivalBefore: arrivalBefore,
            optimizationMode: optimizationMode,
            maximumTransfers,
            minimumTransferMinutes,
            maximumWaitingMinutes,
            maximumJourneyDurationMinutes,
            allowedTrainTypes,
            avoidOvernightTransfers,
          }}
        />
      </div>

      {/* Main Results Layout */}
      {origin && destination ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Filter Sidebar */}
          <div className="lg:col-span-3">
            <FilterSidebar
              onFiltersChange={handleFilterChange}
              initialValues={{
                maxTransfers: maximumTransfers !== undefined ? maximumTransfers : 2,
                maxWaitingMinutes: maximumWaitingMinutes !== undefined ? maximumWaitingMinutes : 1440,
                minReliability: 30,
                avoidOvernightTransfers: avoidOvernightTransfers,
                allowedTrainTypes: allowedTrainTypes || [],
              }}
            />
          </div>

          {/* Right Column: Dynamic Content & Lists */}
          <div className="lg:col-span-9 flex flex-col gap-4">
            {loading ? (
              <LoadingScreen />
            ) : error ? (
              <ErrorScreen
                title="Search Could Not Be Completed"
                message={errorMessage || 'We encountered an error calculating multi-train itineraries. Please double-check station names and time formats.'}
                onRetry={executeSearchQuery}
              />
            ) : filteredJourneys.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                <Compass className="h-10 w-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 mt-4">No matching itineraries</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Try relaxing layout filter limits like maximum waiting times or allowing more transfers.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                  <span>Sorted by overall {optimizationMode.toLowerCase()} score</span>
                  <span>{filteredJourneys.length} route options</span>
                </div>

                <div className="flex flex-col gap-3">
                  {filteredJourneys.map((journey, idx) => {
                    const key = `${journey.departureTime}-${journey.arrivalTime}-${journey.totalTimeMinutes}`;
                    return (
                      <JourneyCard
                        key={idx}
                        journey={journey}
                        onSave={handleSaveJourney}
                        isSaved={savedJourneyIds.includes(key)}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center shadow-sm py-24">
          <Train className="h-12 w-12 text-blue-600/25 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 mt-6">Plan your train connection</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Input origin, destination, and departure times to compute optimal routing itineraries across the railway network.
          </p>
        </div>
      )}
    </div>
  );
}
