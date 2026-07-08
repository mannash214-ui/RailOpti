import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Shuffle, ArrowRight, Server, Database, Code } from 'lucide-react';

export default function Home() {
  const token = localStorage.getItem('optirail_token');

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 flex flex-col items-center text-center">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/15 border border-brand-500/25 rounded-full text-brand-300 text-xs font-semibold tracking-wider mb-6 transition-all">
          <Zap className="h-3.5 w-3.5" />
          <span>V1.0 - MULTI-TRAIN TRANSIT OPTIMIZER</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Find the Most <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-accent-400 bg-clip-text text-transparent">Optimal Itinerary</span> Between Any Two Stations
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Skip generic routers. Set waiting thresholds, control the maximum number of transfers, and leverage reliability indexes to design your perfect railway journey.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/search"
            className="flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-base font-semibold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 transition-all duration-200 border border-brand-500/30 group"
          >
            Open Journey Planner
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          {!token && (
            <Link
              to="/register"
              className="px-8 py-4 bg-navy-900 hover:bg-navy-800 text-slate-200 rounded-xl text-base font-semibold border border-slate-800 transition-all"
            >
              Sign Up For Saved Journeys
            </Link>
          )}
        </div>
      </section>

      {/* Core Constraints Metrics */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-card p-8 rounded-2xl flex flex-col gap-4 relative overflow-hidden group hover:border-brand-500/30 transition-all duration-300">
            <div className="p-3 bg-brand-600/20 rounded-xl w-fit text-brand-400 border border-brand-500/10 group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Smart Wait Reduction</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dynamically filter schedules to ensure that layover gaps are safe but minimal, protecting you against long platform wait times.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-8 rounded-2xl flex flex-col gap-4 relative overflow-hidden group hover:border-brand-500/30 transition-all duration-300">
            <div className="p-3 bg-brand-600/20 rounded-xl w-fit text-brand-400 border border-brand-500/10 group-hover:scale-110 transition-transform">
              <Shuffle className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Transfer Thresholds</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Limit transit to single or double-hop transfers. Determine routes that fit your physical load and pacing perfectly.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-8 rounded-2xl flex flex-col gap-4 relative overflow-hidden group hover:border-brand-500/30 transition-all duration-300">
            <div className="p-3 bg-brand-600/20 rounded-xl w-fit text-brand-400 border border-brand-500/10 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Reliability Indices</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Access real-time historic reliability indicators for individual rail paths to avoid connections prone to delays.
            </p>
          </div>
        </div>
      </section>

      {/* Senior Software Architecture Preview Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900/60">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white">Engineered for Reliability</h2>
          <p className="text-slate-400 mt-3 text-sm">
            OptiRail is built upon clean architecture, strict TypeScript schemas, decoupled routing algorithms, and atomic Mongoose models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-navy-900/40 rounded-xl border border-slate-900 flex items-start gap-4">
            <Code className="h-5 w-5 text-brand-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Strict TypeScript</h4>
              <p className="text-xs text-slate-400 mt-1">Full end-to-end typing for query models, client responses, and scheduling pipelines.</p>
            </div>
          </div>
          <div className="p-6 bg-navy-900/40 rounded-xl border border-slate-900 flex items-start gap-4">
            <Server className="h-5 w-5 text-brand-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Decoupled Business Logic</h4>
              <p className="text-xs text-slate-400 mt-1">Services handle algorithm computation and Mongoose interactions separately from Express controllers.</p>
            </div>
          </div>
          <div className="p-6 bg-navy-900/40 rounded-xl border border-slate-900 flex items-start gap-4">
            <Database className="h-5 w-5 text-brand-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Optimal Database Architecture</h4>
              <p className="text-xs text-slate-400 mt-1">Indexes structured for high-frequency queries between station source and destination points.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
