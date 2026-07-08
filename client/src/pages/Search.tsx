import { useState } from 'react';
import { Compass, Train, Clock, Shuffle, ShieldCheck, ArrowRight, Heart } from 'lucide-react';

interface Itinerary {
  id: string;
  totalDuration: string;
  transfers: number;
  avgWaitingTime: string;
  reliability: number;
  routes: Array<{
    trainNumber: string;
    origin: string;
    destination: string;
    departure: string;
    arrival: string;
  }>;
}

export default function Search() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [maxTransfers, setMaxTransfers] = useState(2);
  const [maxWaitTime, setMaxWaitTime] = useState(60);
  const [minReliability, setMinReliability] = useState(85);
  const [results, setResults] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;

    setLoading(true);
    // Simulate complex multi-train algorithm response after 800ms
    setTimeout(() => {
      setResults([
        {
          id: '1',
          totalDuration: '3h 15m',
          transfers: 1,
          avgWaitingTime: '25m',
          reliability: 96,
          routes: [
            {
              trainNumber: 'EXP 102',
              origin: origin.toUpperCase(),
              destination: 'CENTRAL JUNCTION',
              departure: '08:00 AM',
              arrival: '09:30 AM',
            },
            {
              trainNumber: 'METRO 405',
              origin: 'CENTRAL JUNCTION',
              destination: destination.toUpperCase(),
              departure: '09:55 AM',
              arrival: '11:15 AM',
            },
          ],
        },
        {
          id: '2',
          totalDuration: '3h 45m',
          transfers: 2,
          avgWaitingTime: '15m',
          reliability: 91,
          routes: [
            {
              trainNumber: 'EXP 104',
              origin: origin.toUpperCase(),
              destination: 'EAST NODE',
              departure: '08:15 AM',
              arrival: '09:15 AM',
            },
            {
              trainNumber: 'SHUTTLE 12',
              origin: 'EAST NODE',
              destination: 'WEST CROSSING',
              departure: '09:30 AM',
              arrival: '10:15 AM',
            },
            {
              trainNumber: 'METRO 22',
              origin: 'WEST CROSSING',
              destination: destination.toUpperCase(),
              departure: '10:30 AM',
              arrival: '12:00 PM',
            },
          ],
        },
      ]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
      
      {/* Left Column: Constraints Input Form */}
      <div className="lg:col-span-4">
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-brand-500/10 rounded-bl-2xl border-l border-b border-brand-500/10 text-brand-400">
            <Compass className="h-5 w-5" />
          </div>

          <h2 className="text-xl font-bold text-slate-100 mb-6">Journey Constraints</h2>
          
          <form onSubmit={handleSearch} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Origin Station</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. London King's Cross"
                required
                className="w-full px-4 py-3 bg-navy-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Destination Station</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Edinburgh Waverley"
                required
                className="w-full px-4 py-3 bg-navy-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Travel Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-navy-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-left"
                />
              </div>
            </div>

            {/* Slider: Max Transfers */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <span>Max Transfers</span>
                <span className="text-brand-400 font-bold">{maxTransfers}</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                value={maxTransfers}
                onChange={(e) => setMaxTransfers(parseInt(e.target.value))}
                className="w-full accent-brand-500 bg-navy-900"
              />
            </div>

            {/* Slider: Max Waiting Time */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <span>Max Waiting Time</span>
                <span className="text-brand-400 font-bold">{maxWaitTime} mins</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={maxWaitTime}
                onChange={(e) => setMaxWaitTime(parseInt(e.target.value))}
                className="w-full accent-brand-500 bg-navy-900"
              />
            </div>

            {/* Slider: Min Reliability */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <span>Min Reliability Index</span>
                <span className="text-accent-400 font-bold">{minReliability}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="98"
                value={minReliability}
                onChange={(e) => setMinReliability(parseInt(e.target.value))}
                className="w-full accent-accent-500 bg-navy-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-brand-500/20"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Find Optimal Itinerary'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Search Results Display */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="p-4 bg-navy-900/25 border border-slate-900 rounded-xl text-xs text-slate-400 flex items-center justify-between">
          <span>Optimization mode: <strong>Multi-Train Wait-Time Minimizer</strong></span>
          <span className="text-brand-400">Ready</span>
        </div>

        {results.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl p-16 text-center bg-navy-950/40">
            <Train className="h-12 w-12 text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-300">No Itineraries Loaded</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
              Enter your station routes and custom transit constraints on the left panel to calculate multi-hop itineraries.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((itinerary, index) => (
              <div
                key={itinerary.id}
                className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-brand-500/30 transition-all shadow-lg flex flex-col gap-6 relative overflow-hidden"
              >
                {/* Badge top right */}
                <div className="absolute top-0 right-0 bg-brand-600/15 text-brand-300 px-3 py-1 border-l border-b border-slate-800 text-xs font-bold rounded-bl-xl">
                  Option {index + 1}
                </div>

                {/* Main Metrics Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-900">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4.5 w-4.5 text-slate-400" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Time</p>
                      <p className="text-sm font-bold text-slate-200">{itinerary.totalDuration}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Shuffle className="h-4.5 w-4.5 text-slate-400" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Transfers</p>
                      <p className="text-sm font-bold text-slate-200">
                        {itinerary.transfers === 0 ? 'Direct' : `${itinerary.transfers} stops`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4.5 w-4.5 text-slate-400" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Avg Wait Time</p>
                      <p className="text-sm font-bold text-slate-200">{itinerary.avgWaitingTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4.5 w-4.5 text-accent-500" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Reliability Index</p>
                      <p className="text-sm font-bold text-accent-400">{itinerary.reliability}%</p>
                    </div>
                  </div>
                </div>

                {/* Path Segment Timelines */}
                <div className="space-y-4">
                  {itinerary.routes.map((segment, segIdx) => (
                    <div key={segIdx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-navy-900/35 border border-slate-900 rounded-xl relative">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg text-xs font-bold text-slate-300">
                          {segment.trainNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                            <span>{segment.origin}</span>
                            <ArrowRight className="h-3 w-3 text-slate-500" />
                            <span>{segment.destination}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">Leg {segIdx + 1}</p>
                        </div>
                      </div>

                      <div className="flex gap-6 text-xs text-right">
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase font-semibold">Departure</p>
                          <p className="font-bold text-slate-300">{segment.departure}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase font-semibold">Arrival</p>
                          <p className="font-bold text-slate-300">{segment.arrival}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Saved Journey buttons */}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-slate-500">Calculated in 2ms</span>
                  <button className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors">
                    <Heart className="h-3.5 w-3.5" />
                    Save to My Journeys
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
