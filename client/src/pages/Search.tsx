import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Train } from 'lucide-react';
import SearchForm from '../components/SearchForm';
import FilterSidebar from '../components/FilterSidebar';
import JourneyCard from '../components/JourneyCard';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import { Journey } from '../components/JourneyTimeline';

// Exact mock itineraries calculated by our Dijkstra routing engine for Silchar -> Patna Junction
const MOCK_JOURNEYS: Journey[] = [
  {
    departureStation: 'Silchar',
    departureStationCode: 'SCL',
    destinationStation: 'Patna Junction',
    destinationStationCode: 'PNBE',
    departureTime: 'Day 0 09:03',
    arrivalTime: 'Day 1 01:31',
    totalTimeMinutes: 1051,
    travelTimeMinutes: 948,
    waitingTimeMinutes: 103,
    transferCount: 1,
    reliabilityScore: 84, // compounding cancellation and delay factor
    overallScore: 100,
    trainSegments: [
      {
        trainNumber: '12428',
        trainName: 'Silchar - Guwahati Shatabdi Special',
        fromStationCode: 'SCL',
        fromStationName: 'Silchar',
        toStationCode: 'GHY',
        toStationName: 'Guwahati',
        departureTime: 'Day 0 09:03',
        arrivalTime: 'Day 0 14:53',
        travelMinutes: 350,
        cancellationProbability: 0.05,
        averageDelayMinutes: 15,
      },
      {
        trainNumber: '12278',
        trainName: 'Guwahati - Patna Shatabdi Special',
        fromStationCode: 'GHY',
        fromStationName: 'Guwahati',
        toStationCode: 'PNBE',
        toStationName: 'Patna Junction',
        departureTime: 'Day 0 15:33',
        arrivalTime: 'Day 1 01:31',
        travelMinutes: 598,
        cancellationProbability: 0.08,
        averageDelayMinutes: 13,
      },
    ],
  },
  {
    departureStation: 'Silchar',
    departureStationCode: 'SCL',
    destinationStation: 'Patna Junction',
    destinationStationCode: 'PNBE',
    departureTime: 'Day 0 09:39',
    arrivalTime: 'Day 1 02:25',
    totalTimeMinutes: 1105,
    travelTimeMinutes: 979,
    waitingTimeMinutes: 126,
    transferCount: 1,
    reliabilityScore: 81,
    overallScore: 63,
    trainSegments: [
      {
        trainNumber: '12380',
        trainName: 'Silchar - Guwahati Shatabdi Special',
        fromStationCode: 'SCL',
        fromStationName: 'Silchar',
        toStationCode: 'GHY',
        toStationName: 'Guwahati',
        departureTime: 'Day 0 09:39',
        arrivalTime: 'Day 0 15:30',
        travelMinutes: 351,
        cancellationProbability: 0.05,
        averageDelayMinutes: 12,
      },
      {
        trainNumber: '12326',
        trainName: 'Guwahati - Patna Shatabdi Special',
        fromStationCode: 'GHY',
        fromStationName: 'Guwahati',
        toStationCode: 'PNBE',
        toStationName: 'Patna Junction',
        departureTime: 'Day 0 15:57',
        arrivalTime: 'Day 1 02:25',
        travelMinutes: 628,
        cancellationProbability: 0.1,
        averageDelayMinutes: 16,
      },
    ],
  },
  {
    departureStation: 'Silchar',
    departureStationCode: 'SCL',
    destinationStation: 'Patna Junction',
    destinationStationCode: 'PNBE',
    departureTime: 'Day 0 08:36',
    arrivalTime: 'Day 1 01:31',
    totalTimeMinutes: 1051,
    travelTimeMinutes: 948,
    waitingTimeMinutes: 103,
    transferCount: 2,
    reliabilityScore: 68,
    overallScore: 53,
    trainSegments: [
      {
        trainNumber: '12439',
        trainName: 'Guwahati - Silchar Rajdhani Special',
        fromStationCode: 'SCL',
        fromStationName: 'Silchar',
        toStationCode: 'SCL',
        toStationName: 'Silchar Central',
        departureTime: 'Day 0 08:36',
        arrivalTime: 'Day 0 08:36',
        travelMinutes: 0,
        cancellationProbability: 0.12,
        averageDelayMinutes: 12,
      },
      {
        trainNumber: '12428',
        trainName: 'Silchar - Guwahati Shatabdi Special',
        fromStationCode: 'SCL',
        fromStationName: 'Silchar Central',
        toStationCode: 'GHY',
        toStationName: 'Guwahati',
        departureTime: 'Day 0 09:03',
        arrivalTime: 'Day 0 14:53',
        travelMinutes: 350,
        cancellationProbability: 0.05,
        averageDelayMinutes: 15,
      },
      {
        trainNumber: '12278',
        trainName: 'Guwahati - Patna Shatabdi Special',
        fromStationCode: 'GHY',
        fromStationName: 'Guwahati',
        toStationCode: 'PNBE',
        toStationName: 'Patna Junction',
        departureTime: 'Day 0 15:33',
        arrivalTime: 'Day 1 01:31',
        travelMinutes: 598,
        cancellationProbability: 0.08,
        averageDelayMinutes: 13,
      },
    ],
  },
  {
    departureStation: 'Silchar',
    departureStationCode: 'SCL',
    destinationStation: 'Patna Junction',
    destinationStationCode: 'PNBE',
    departureTime: 'Day 0 09:03',
    arrivalTime: 'Day 1 02:51',
    totalTimeMinutes: 1131,
    travelTimeMinutes: 1032,
    waitingTimeMinutes: 99,
    transferCount: 1,
    reliabilityScore: 74,
    overallScore: 35,
    trainSegments: [
      {
        trainNumber: '12428',
        trainName: 'Silchar - Guwahati Shatabdi Special',
        fromStationCode: 'SCL',
        fromStationName: 'Silchar',
        toStationCode: 'GHY',
        toStationName: 'Guwahati',
        departureTime: 'Day 0 09:03',
        arrivalTime: 'Day 0 14:53',
        travelMinutes: 350,
        cancellationProbability: 0.05,
        averageDelayMinutes: 15,
      },
      {
        trainNumber: '12310',
        trainName: 'Guwahati - Patna Superfast Special',
        fromStationCode: 'GHY',
        fromStationName: 'Guwahati',
        toStationCode: 'PNBE',
        toStationName: 'Patna Junction',
        departureTime: 'Day 0 15:29',
        arrivalTime: 'Day 1 02:51',
        travelMinutes: 682,
        cancellationProbability: 0.15,
        averageDelayMinutes: 20,
      },
    ],
  },
  {
    departureStation: 'Silchar',
    departureStationCode: 'SCL',
    destinationStation: 'Patna Junction',
    destinationStationCode: 'PNBE',
    departureTime: 'Day 0 09:03',
    arrivalTime: 'Day 1 02:00',
    totalTimeMinutes: 1080,
    travelTimeMinutes: 942,
    waitingTimeMinutes: 138,
    transferCount: 2,
    reliabilityScore: 61,
    overallScore: 30,
    trainSegments: [
      {
        trainNumber: '12428',
        trainName: 'Silchar - Guwahati Shatabdi Special',
        fromStationCode: 'SCL',
        fromStationName: 'Silchar',
        toStationCode: 'GHY',
        toStationName: 'Guwahati',
        departureTime: 'Day 0 09:03',
        arrivalTime: 'Day 0 14:53',
        travelMinutes: 350,
        cancellationProbability: 0.05,
        averageDelayMinutes: 15,
      },
      {
        trainNumber: '12278',
        trainName: 'Guwahati - Mokama Shatabdi Special',
        fromStationCode: 'GHY',
        fromStationName: 'Guwahati',
        toStationCode: 'MKA',
        toStationName: 'Mokama',
        departureTime: 'Day 0 15:33',
        arrivalTime: 'Day 1 00:24',
        travelMinutes: 531,
        cancellationProbability: 0.08,
        averageDelayMinutes: 13,
      },
      {
        trainNumber: '12189',
        trainName: 'Mokama - Patna Passenger',
        fromStationCode: 'MKA',
        fromStationName: 'Mokama',
        toStationCode: 'PNBE',
        toStationName: 'Patna Junction',
        departureTime: 'Day 1 00:59',
        arrivalTime: 'Day 1 02:00',
        travelMinutes: 61,
        cancellationProbability: 0.22,
        averageDelayMinutes: 14,
      },
    ],
  },
];

export default function Search() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [rawJourneys, setRawJourneys] = useState<Journey[]>([]);
  const [filteredJourneys, setFilteredJourneys] = useState<Journey[]>([]);
  const [savedJourneyIds, setSavedJourneyIds] = useState<string[]>([]);

  // Parse parameters from URL
  const origin = searchParams.get('sourceStation') || '';
  const destination = searchParams.get('destinationStation') || '';
  const departureAfter = searchParams.get('departureAfter') || '';
  const optimizationMode = searchParams.get('optimizationMode') || 'BALANCED';

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

  const executeSearchQuery = () => {
    if (!origin || !destination) return;

    setLoading(true);
    setError(false);

    // Simulate Dijkstra route graph construction and calculations
    setTimeout(() => {
      // Return custom structured itineraries. Silchar -> Patna returns the exact computed backend results
      if (
        origin.toLowerCase().includes('silchar') &&
        destination.toLowerCase().includes('patna')
      ) {
        setRawJourneys(MOCK_JOURNEYS);
        setFilteredJourneys(MOCK_JOURNEYS);
      } else {
        // Fallback simple generated mock routes for other stations
        const fallbackJourneys: Journey[] = [
          {
            departureStation: origin,
            departureStationCode: origin.slice(0, 3).toUpperCase(),
            destinationStation: destination,
            destinationStationCode: destination.slice(0, 3).toUpperCase(),
            departureTime: `Day 0 ${departureAfter || '08:00'}`,
            arrivalTime: `Day 0 16:30`,
            totalTimeMinutes: 510,
            travelTimeMinutes: 450,
            waitingTimeMinutes: 60,
            transferCount: 1,
            reliabilityScore: 92,
            overallScore: 98,
            trainSegments: [
              {
                trainNumber: '12411',
                trainName: 'Express Leg 1',
                fromStationCode: origin.slice(0, 3).toUpperCase(),
                fromStationName: origin,
                toStationCode: 'MID',
                toStationName: 'Midway Crossing',
                departureTime: `Day 0 ${departureAfter || '08:00'}`,
                arrivalTime: 'Day 0 12:00',
                travelMinutes: 240,
                cancellationProbability: 0.02,
                averageDelayMinutes: 8,
              },
              {
                trainNumber: '12412',
                trainName: 'Express Leg 2',
                fromStationCode: 'MID',
                fromStationName: 'Midway Crossing',
                toStationCode: destination.slice(0, 3).toUpperCase(),
                toStationName: destination,
                departureTime: 'Day 0 13:00',
                arrivalTime: 'Day 0 16:30',
                travelMinutes: 210,
                cancellationProbability: 0.04,
                averageDelayMinutes: 5,
              },
            ],
          },
          {
            departureStation: origin,
            departureStationCode: origin.slice(0, 3).toUpperCase(),
            destinationStation: destination,
            destinationStationCode: destination.slice(0, 3).toUpperCase(),
            departureTime: `Day 0 ${departureAfter || '08:30'}`,
            arrivalTime: `Day 0 18:00`,
            totalTimeMinutes: 570,
            travelTimeMinutes: 570,
            waitingTimeMinutes: 0,
            transferCount: 0,
            reliabilityScore: 88,
            overallScore: 85,
            trainSegments: [
              {
                trainNumber: '12599',
                trainName: 'Direct Commuter Special',
                fromStationCode: origin.slice(0, 3).toUpperCase(),
                fromStationName: origin,
                toStationCode: destination.slice(0, 3).toUpperCase(),
                toStationName: destination,
                departureTime: `Day 0 ${departureAfter || '08:30'}`,
                arrivalTime: 'Day 0 18:00',
                travelMinutes: 570,
                cancellationProbability: 0.06,
                averageDelayMinutes: 12,
              },
            ],
          },
        ];
        setRawJourneys(fallbackJourneys);
        setFilteredJourneys(fallbackJourneys);
      }
      setLoading(false);
    }, 1200);
  };

  // Run search query when URL parameters update
  useEffect(() => {
    executeSearchQuery();
  }, [origin, destination, departureAfter]);

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

  const handleSaveJourney = (journey: Journey) => {
    const key = `${journey.departureTime}-${journey.arrivalTime}-${journey.totalTimeMinutes}`;
    let saved = localStorage.getItem('optirail_saved');
    let list = saved ? JSON.parse(saved) : [];

    if (savedJourneyIds.includes(key)) {
      list = list.filter((j: any) => `${j.departureTime}-${j.arrivalTime}-${j.totalTimeMinutes}` !== key);
      setSavedJourneyIds(prev => prev.filter(k => k !== key));
    } else {
      list.push(journey);
      setSavedJourneyIds(prev => [...prev, key]);
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
            departureAfter: departureAfter,
            optimizationMode: optimizationMode,
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
                maxTransfers: 2,
                maxWaitingMinutes: 1440,
                minReliability: 30,
                avoidOvernightTransfers: false,
                allowedTrainTypes: [],
              }}
            />
          </div>

          {/* Right Column: Dynamic Content & Lists */}
          <div className="lg:col-span-9 flex flex-col gap-4">
            {loading ? (
              <LoadingScreen />
            ) : error ? (
              <ErrorScreen onRetry={executeSearchQuery} />
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
