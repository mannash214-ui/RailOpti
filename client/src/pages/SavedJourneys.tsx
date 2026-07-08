import { Link } from 'react-router-dom';
import { Heart, Train, Clock, ArrowRight, ShieldCheck, Trash2 } from 'lucide-react';

export default function SavedJourneys() {
  const token = localStorage.getItem('optirail_token');

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex-grow flex flex-col items-center justify-center text-center">
        <Heart className="h-12 w-12 text-slate-700 mb-4" />
        <h2 className="text-xl font-bold text-slate-200">Access Restricted</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          Please create an account or sign in to save your preferred journey itineraries and reliability options.
        </p>
        <div className="mt-6 flex gap-4">
          <Link to="/login" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-semibold transition-all">
            Sign In
          </Link>
          <Link to="/register" className="px-5 py-2.5 bg-navy-900 border border-slate-800 hover:bg-navy-800 text-slate-300 rounded-lg text-sm font-semibold transition-all">
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  // Pre-loaded saved journey mock data
  const savedList = [
    {
      id: 'saved-1',
      origin: 'LONDON KINGS CROSS',
      destination: 'EDINBURGH WAVERLEY',
      totalDuration: '4h 05m',
      transfers: 1,
      reliability: 94,
      savedDate: '2026-07-08',
    },
    {
      id: 'saved-2',
      origin: 'MANCHESTER PICCADILLY',
      destination: 'NEWCASTLE CENTRAL',
      totalDuration: '2h 15m',
      transfers: 0,
      reliability: 97,
      savedDate: '2026-07-05',
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500 fill-rose-500" /> Saved Journeys
          </h1>
          <p className="text-xs text-slate-400 mt-1">Your pinned routes optimized for travel time and reliability</p>
        </div>
        <Link to="/search" className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors">
          Plan Another Route →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savedList.map((journey) => (
          <div
            key={journey.id}
            className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-brand-500/20 transition-all flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <span>{journey.origin}</span>
                <ArrowRight className="h-3 w-3 text-slate-500" />
                <span>{journey.destination}</span>
              </div>
              <button className="text-slate-500 hover:text-rose-400 transition-colors p-1.5 hover:bg-rose-500/10 rounded-lg">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-slate-900 text-xs">
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Duration</p>
                <p className="font-bold text-slate-300 flex items-center gap-1 mt-0.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  {journey.totalDuration}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Transfers</p>
                <p className="font-bold text-slate-300 flex items-center gap-1 mt-0.5">
                  <Train className="h-3.5 w-3.5 text-slate-500" />
                  {journey.transfers === 0 ? 'Direct' : `${journey.transfers} stops`}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Reliability</p>
                <p className="font-bold text-accent-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent-500" />
                  {journey.reliability}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>Saved on {journey.savedDate}</span>
              <Link to="/search" className="text-brand-400 hover:text-brand-300 font-semibold">
                Re-Run Planner
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
