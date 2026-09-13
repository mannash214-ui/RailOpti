import { Train } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Brand info */}
          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                <Train className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-wide">
                Opti<span className="text-blue-600">Rail</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              OptiRail is an advanced multi-train routing and journey optimization platform designed to find highly reliable, low-waiting-time itineraries based on custom transit metrics.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {currentYear} OptiRail Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
