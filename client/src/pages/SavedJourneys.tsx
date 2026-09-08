import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Train, Clock, ArrowRight, ShieldCheck, Trash2, Search, Compass, AlertCircle } from 'lucide-react';
import journeyService from '../services/journeyService';

export default function SavedJourneys() {
  const [journeys, setJourneys] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const token = localStorage.getItem('optirail_token');

  const fetchJourneys = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await journeyService.getUserJourneys();
      setJourneys(data || []);
    } catch (err: any) {
      console.error('Error loading saved journeys:', err);
      setError('Failed to load saved routes from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchJourneys();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleDelete = async (id: string) => {
    try {
      await journeyService.delete(id);
      setJourneys((prev) => prev.filter((j) => (j._id || j.id) !== id));
    } catch (err) {
      console.error('Failed to delete saved journey:', err);
      alert('Failed to remove saved route.');
    }
  };

  const handleReRun = (journey: any) => {
    const from = journey.departureStation || journey.departureStationCode || '';
    const to = journey.destinationStation || journey.destinationStationCode || '';
    if (from && to) {
      navigate(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    } else {
      navigate('/search');
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 flex-grow flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-blue-50 rounded-full text-blue-600 border border-blue-200 mb-4 shadow-sm">
          <Heart className="h-8 w-8 text-rose-500 fill-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Access Restricted</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Please sign in to save your preferred rail itineraries and view your saved trips.
        </p>
        <div className="mt-6 flex gap-3 w-full">
          <Link
            to="/login"
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm text-center"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="flex-1 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-colors text-center"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500 fill-rose-500" /> Saved Journeys
          </h1>
          <p className="text-xs text-slate-500 mt-1">Your pinned railway routes synced with your account</p>
        </div>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Search className="h-3.5 w-3.5" /> Plan New Journey
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading saved routes from database...</p>
        </div>
      ) : journeys.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm my-8">
          <div className="h-14 w-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Compass className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Saved Journeys Yet</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            When you search for routes, click the star icon on any itinerary card to pin it to your saved trips.
          </p>
          <div className="mt-6">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Search className="h-4 w-4" /> Start Searching Routes
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {journeys.map((j) => {
            const jId = j._id || j.id;
            const depStation = j.departureStation || j.departureStationCode || 'Origin';
            const arrStation = j.destinationStation || j.destinationStationCode || 'Destination';
            const duration = j.totalTimeMinutes ? `${Math.floor(j.totalTimeMinutes / 60)}h ${j.totalTimeMinutes % 60}m` : (j.totalDuration || 'N/A');
            const transfers = j.transferCount !== undefined ? j.transferCount : (j.transfers || 0);
            const reliability = j.reliabilityScore !== undefined ? j.reliabilityScore : (j.reliability || 95);

            return (
              <div
                key={jId}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <span>{depStation}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    <span>{arrStation}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(jId)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 hover:bg-rose-50 rounded-lg"
                    title="Remove saved route"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-100 text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Duration</p>
                    <p className="font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {duration}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Transfers</p>
                    <p className="font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                      <Train className="h-3.5 w-3.5 text-slate-400" />
                      {transfers === 0 ? 'Direct' : `${transfers} stops`}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Reliability</p>
                    <p className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      {reliability}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Saved to your account</span>
                  <button
                    onClick={() => handleReRun(j)}
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                  >
                    Re-Run Planner →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
