import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Heart,
  Search,
  Sliders,
  ShieldCheck,
  Zap,
  Clock,
  Train,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Moon,
  TrendingUp,
  MapPin,
  Lock,
  LogIn,
  Trash2
} from 'lucide-react';
import journeyService from '../services/journeyService';

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('optirail_token');
  const userString = localStorage.getItem('optirail_user');
  const user = userString ? JSON.parse(userString) : null;

  // Live user saved journeys from database
  const [savedJourneys, setSavedJourneys] = useState<any[]>([]);
  const [loadingJourneys, setLoadingJourneys] = useState<boolean>(true);

  // Passenger travel preference state (persisted to localStorage)
  const [optMode, setOptMode] = useState<string>(
    localStorage.getItem('optirail_pref_optMode') || 'BALANCED'
  );
  const [minLayover, setMinLayover] = useState<number>(
    Number(localStorage.getItem('optirail_pref_minLayover')) || 20
  );
  const [avoidOvernight, setAvoidOvernight] = useState<boolean>(
    localStorage.getItem('optirail_pref_avoidOvernight') === 'true'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchUserJourneys = async () => {
    if (!token) return;
    setLoadingJourneys(true);
    try {
      const data = await journeyService.getUserJourneys();
      setSavedJourneys(data || []);
    } catch (err) {
      console.error('Failed to load user saved journeys in Dashboard:', err);
    } finally {
      setLoadingJourneys(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserJourneys();
    } else {
      setLoadingJourneys(false);
    }
  }, [token]);

  const handleDeleteSaved = async (id: string) => {
    try {
      await journeyService.delete(id);
      setSavedJourneys((prev) => prev.filter((j) => (j._id || j.id) !== id));
    } catch (err) {
      console.error('Failed to delete saved route:', err);
    }
  };

  const handleSavePreferences = () => {
    localStorage.setItem('optirail_pref_optMode', optMode);
    localStorage.setItem('optirail_pref_minLayover', String(minLayover));
    localStorage.setItem('optirail_pref_avoidOvernight', String(avoidOvernight));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleQuickSearch = (from: string, to: string) => {
    navigate(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  };

  // If user is not authenticated, show crisp login gate
  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 flex-grow flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-blue-50 rounded-full text-blue-600 border border-blue-200 mb-5 shadow-sm">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Passenger Portal</h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Please sign in to access your passenger travel profile, saved itineraries, and travel preferences.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
          <Link
            to="/login"
            className="flex-1 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" /> Sign In
          </Link>
          <Link
            to="/register"
            className="flex-1 px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  // Calculate live dynamic metrics from user's real saved database routes
  const totalSavedCount = savedJourneys.length;
  const avgReliability =
    totalSavedCount > 0
      ? Math.round(
          savedJourneys.reduce(
            (acc, curr) => acc + (curr.reliabilityScore || curr.reliability || 95),
            0
          ) / totalSavedCount
        )
      : 96;

  // Pre-loaded frequent passenger corridors
  const frequentCorridors = [
    { from: 'Silchar', fromCode: 'SCL', to: 'Patna Junction', toCode: 'PNBE', trains: '15612 / 05226', avgTime: '25h 13m' },
    { from: 'Guwahati', fromCode: 'GHY', to: 'Howrah Junction', toCode: 'HWH', trains: '12346 / 12510', avgTime: '17h 45m' },
    { from: 'Howrah Junction', fromCode: 'HWH', to: 'New Jalpaiguri', toCode: 'NJP', trains: '12041 / 22301', avgTime: '8h 10m' },
    { from: 'Patna Junction', fromCode: 'PNBE', to: 'New Delhi', toCode: 'NDLS', trains: '12309 / 20801', avgTime: '11h 55m' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* 1. Passenger Hero Welcome Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xl">
            {user?.name ? user.name[0].toUpperCase() : 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{user?.name || 'Rail Traveler'}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
                <Sparkles className="h-3 w-3 text-blue-600" /> Active Traveler
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{user?.email || 'traveler@optirail.com'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/search"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <Search className="h-4 w-4" /> Plan New Journey
          </Link>
          <Link
            to="/saved-journeys"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 border border-slate-200"
          >
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500" /> Saved Trips ({totalSavedCount})
          </Link>
        </div>
      </div>

      {/* 2. Synchronized Live Dynamic KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Searches Executed</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">Active</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600 border border-rose-100">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saved Routes</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalSavedCount} Bookmarks</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Route Reliability</p>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">{avgReliability}% On-Time</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Network Coverage</p>
            <p className="text-xl font-bold text-indigo-700 mt-0.5">275 Stations</p>
          </div>
        </div>
      </div>

      {/* 3. Frequent Corridors Launcher */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-blue-600" /> Frequent Rail Corridors
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Launch 1-click multi-train searches for popular routes</p>
          </div>
          <Link to="/search" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Explore All Stations <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {frequentCorridors.map((c, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickSearch(c.from, c.to)}
              className="group p-4 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  <span>{c.fromCode}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  <span>{c.toCode}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {c.from} ➔ {c.to}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {c.avgTime}</span>
                <span className="text-blue-600 font-semibold">Search →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Passenger Travel Preferences & Real Saved Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="h-4.5 w-4.5 text-blue-600" /> Travel Optimization Preferences
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Customize your default routing preferences for journey search queries</p>
            </div>
            {savedSuccess && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 animate-fadeIn">
                <CheckCircle2 className="h-4 w-4" /> Preferences Saved!
              </span>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Default Optimization Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setOptMode('BALANCED')}
                  className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
                    optMode === 'BALANCED'
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 text-slate-900">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" /> Balanced Choice
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Optimal mix of travel speed and transfer comfort</p>
                </button>

                <button
                  type="button"
                  onClick={() => setOptMode('FASTEST')}
                  className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
                    optMode === 'FASTEST'
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 text-slate-900">
                    <Zap className="h-3.5 w-3.5 text-amber-500" /> Fastest Arrival
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Minimizes overall journey time</p>
                </button>

                <button
                  type="button"
                  onClick={() => setOptMode('RELIABILITY')}
                  className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
                    optMode === 'RELIABILITY'
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 text-slate-900">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Highest Reliability
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Prioritizes low-delay trains and safer layovers</p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Minimum Preferred Layover</label>
                <select
                  value={minLayover}
                  onChange={(e) => setMinLayover(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value={15}>15 Minutes (Quick Layover)</option>
                  <option value={20}>20 Minutes (Standard Layover)</option>
                  <option value={30}>30 Minutes (Relaxed Layover)</option>
                  <option value={45}>45 Minutes (Extended Buffer)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Overnight Transfer Filter</label>
                <button
                  type="button"
                  onClick={() => setAvoidOvernight(!avoidOvernight)}
                  className={`w-full p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                    avoidOvernight
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                      : 'bg-slate-50 border-slate-300 text-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Moon className="h-3.5 w-3.5 text-indigo-600" /> Avoid Midnight Layovers
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${avoidOvernight ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {avoidOvernight ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>

        {/* Real User Saved Routes Preview Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-500" /> Saved Pinned Routes
              </h2>
              <Link to="/saved-journeys" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                View All ({totalSavedCount})
              </Link>
            </div>

            {loadingJourneys ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading saved routes...</div>
            ) : savedJourneys.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center my-2 space-y-2">
                <Compass className="h-6 w-6 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No Saved Trips Yet</p>
                <p className="text-[11px] text-slate-500">Plan a journey and click the star icon to pin it here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedJourneys.slice(0, 3).map((j) => {
                  const jId = j._id || j.id;
                  const dep = j.departureStation || j.departureStationCode || 'Origin';
                  const arr = j.destinationStation || j.destinationStationCode || 'Destination';
                  const rel = j.reliabilityScore !== undefined ? j.reliabilityScore : (j.reliability || 95);
                  const dur = j.totalTimeMinutes ? `${Math.floor(j.totalTimeMinutes / 60)}h ${j.totalTimeMinutes % 60}m` : (j.totalDuration || 'N/A');
                  const trs = j.transferCount !== undefined ? j.transferCount : (j.transfers || 0);

                  return (
                    <div key={jId} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 relative group">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span className="line-clamp-1 pr-6">{dep} ➔ {arr}</span>
                        <button
                          onClick={() => handleDeleteSaved(jId)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove saved route"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {dur}</span>
                        <span className="flex items-center gap-1"><Train className="h-3 w-3" /> {trs === 0 ? 'Direct' : `${trs} Transfer`}</span>
                        <span className="text-emerald-700 font-mono font-bold">{rel}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-center">
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Plan Custom Connection <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
