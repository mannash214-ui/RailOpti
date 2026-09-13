import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Shuffle, Zap } from 'lucide-react';
import SearchForm from '../components/SearchForm';

export default function Home() {
  const token = localStorage.getItem('optirail_token');

  const popularRoutes = [
    { from: 'Silchar', to: 'Patna', desc: 'Optimal Shatabdi Route', time: '08:00' },
    { from: 'Guwahati', to: 'Patna', desc: 'Direct & Shatabdi alternatives', time: '15:30' },
    { from: 'Silchar', to: 'Guwahati', desc: 'Daily express commuters', time: '09:00' },
  ];

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-blue-50/50 via-white to-transparent pt-12 pb-8 flex flex-col items-center">
        <div className="w-full max-w-4xl mx-auto px-4 text-center mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            Compare optimal railway journeys
          </h1>
          <p className="mt-2.5 text-slate-500 text-sm max-w-xl mx-auto">
            Design schedules matching your physical load, transfer limits, waiting limits, and reliability preferences.
          </p>
        </div>

        {/* Embedded Search Form in Google Flights card styling */}
        <div className="w-full max-w-4xl mx-auto px-4 z-10">
          <SearchForm />
        </div>
      </section>

      {/* Popular Explorations */}
      <section className="w-full max-w-4xl mx-auto px-4 py-8">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Popular routing searches</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {popularRoutes.map((route, idx) => (
            <Link
              key={idx}
              to={`/search?sourceStation=${route.from}&destinationStation=${route.to}&departureAfter=${route.time}&optimizationMode=BALANCED`}
              className="google-card p-4 flex flex-col justify-between hover:border-blue-400 group transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                  <span>Explore suggestion</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-blue-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  {route.from} to {route.to}
                </h4>
                <p className="text-xs text-slate-500 mt-1">{route.desc}</p>
              </div>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 rounded px-2 py-0.5 mt-3 w-fit">
                Departs {route.time}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Constraints features grid */}
      <section className="w-full max-w-4xl mx-auto px-4 py-12 border-t border-slate-200 mt-8">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-slate-900">Configured Search Bounds</h2>
          <p className="text-slate-500 text-xs mt-1">Our engine validates complex multi-train transfer rules at every graph step.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="google-card p-6 flex flex-col gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 w-fit">
              <Zap className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Multi-Hop Layover Windows</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Limit transit to single or double-hop transfers. Control minimum and maximum transfer intervals to ensure layovers are realistic.
            </p>
          </div>

          <div className="google-card p-6 flex flex-col gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 w-fit">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Cancellations & Delay Ratios</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Score routes by compounding cancellation indexes and delays. Prioritize reliability using the MOST_RELIABLE ranking mode.
            </p>
          </div>

          <div className="google-card p-6 flex flex-col gap-3">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600 w-fit">
              <Shuffle className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Overnight Restriction Rules</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Avoid sleeping on platform benches. Enable "avoidOvernightTransfers" to reject any wait time crossing calendar days.
            </p>
          </div>
        </div>
      </section>

      {/* Account actions CTA */}
      {!token && (
        <section className="w-full max-w-4xl mx-auto px-4 py-8 mb-12">
          <div className="bg-blue-600 rounded-xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <h4 className="text-base font-bold">Save and track your routes</h4>
              <p className="text-xs text-blue-100 mt-1">Register for an OptiRail account to save plans and monitor delay alerts.</p>
            </div>
            <Link
              to="/register"
              className="px-5 py-2.5 bg-white text-blue-600 rounded-lg text-sm font-bold shadow hover:bg-blue-50 transition-colors"
            >
              Sign Up Free
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
