import { Train, ShieldAlert, Cpu, Database } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 border-t border-slate-900/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-brand-600/20 rounded-lg border border-brand-500/10">
                <Train className="h-5 w-5 text-brand-400" />
              </div>
              <span className="font-bold text-lg text-slate-100 tracking-wide">
                Opti<span className="text-brand-400">Rail</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              OptiRail is an advanced multi-train routing and journey optimization platform designed to find highly reliable, low-waiting-time itineraries based on custom transit metrics.
            </p>
            <div className="flex items-center gap-2 p-3 bg-amber-950/20 border border-amber-900/30 text-amber-300 rounded-lg text-xs max-w-sm">
              <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0 text-amber-500" />
              <span>
                <strong>Note:</strong> OptiRail is NOT a booking system. We specialize strictly in routing analytics and transit optimization.
              </span>
            </div>
          </div>

          {/* Quick Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-brand-500" /> System Engine
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Multi-Train Routing</li>
              <li>Wait-Time Reducers</li>
              <li>Reliability Indicators</li>
              <li>Transfer Optimization</li>
            </ul>
          </div>

          {/* Stack Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-accent-500" /> Core Stack
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>React, TS, TailwindCSS</li>
              <li>React Query & Axios</li>
              <li>Node.js & Express</li>
              <li>Mongoose & MongoDB</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} OptiRail Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-slate-400 cursor-pointer">Security Protocol</span>
            <span className="hover:text-slate-400 cursor-pointer">Architecture Model</span>
            <span className="hover:text-slate-400 cursor-pointer">API Specs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
