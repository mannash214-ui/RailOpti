import { Link } from 'react-router-dom';
import { LayoutDashboard, Compass, Heart, Activity, Settings, User } from 'lucide-react';

export default function Dashboard() {
  const token = localStorage.getItem('optirail_token');
  const userString = localStorage.getItem('optirail_user');
  const user = userString ? JSON.parse(userString) : null;

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex-grow flex flex-col items-center justify-center text-center">
        <LayoutDashboard className="h-12 w-12 text-slate-700 mb-4" />
        <h2 className="text-xl font-bold text-slate-200">Access Restricted</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          Please create an account or sign in to access the system dashboard and personalized settings.
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-brand-400" /> Account Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manage search profiles, system reliability, and your preferences</p>
      </div>

      {/* Grid KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400 border border-brand-500/15">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Active Profile</p>
            <p className="text-sm font-bold text-slate-200 mt-0.5">{user?.name || 'Rail Planner'}</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/15">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Searches</p>
            <p className="text-lg font-bold text-slate-200 mt-0.5">14</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/15">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Saved Routes</p>
            <p className="text-lg font-bold text-slate-200 mt-0.5">2</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-accent-500/10 rounded-xl text-accent-400 border border-accent-500/15">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Database Status</p>
            <p className="text-sm font-bold text-accent-400 mt-0.5">Operational</p>
          </div>
        </div>
      </div>

      {/* Subsystem Telemetry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card: Preference defaults */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800/80">
          <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Settings className="h-4.5 w-4.5 text-brand-400" /> Default Search Optimization Schema
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-navy-900/40 border border-slate-900 rounded-xl">
              <div>
                <p className="text-xs font-semibold text-slate-300">Wait-Time Threshold Protection</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Alert if transfer wait duration is under 15 minutes</p>
              </div>
              <span className="px-2 py-1 bg-brand-500/15 border border-brand-500/20 text-brand-300 text-[10px] rounded-lg font-bold">Enabled</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-navy-900/40 border border-slate-900 rounded-xl">
              <div>
                <p className="text-xs font-semibold text-slate-300">Multi-Path Engine Priority</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Target the highest reliability metric over time duration</p>
              </div>
              <span className="px-2 py-1 bg-navy-800 text-slate-400 text-[10px] rounded-lg font-medium">Standard</span>
            </div>
          </div>
        </div>

        {/* Right Card: Platform engine details */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex flex-col gap-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-brand-400" /> Backend Engine
          </h3>
          <div className="space-y-3 text-xs text-slate-400">
            <div className="flex justify-between border-b border-navy-900 pb-2">
              <span>Routing Algorithm</span>
              <span className="text-slate-200 font-semibold">Decoupled Dijkstra/RAPTOR</span>
            </div>
            <div className="flex justify-between border-b border-navy-900 pb-2">
              <span>Station Database</span>
              <span className="text-slate-200 font-semibold">MongoDB Atlas</span>
            </div>
            <div className="flex justify-between border-b border-navy-900 pb-2">
              <span>REST Client</span>
              <span className="text-slate-200 font-semibold">Axios Interceptors</span>
            </div>
            <div className="flex justify-between">
              <span>API Gateway</span>
              <span className="text-accent-400 font-semibold">Express Middleware</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
