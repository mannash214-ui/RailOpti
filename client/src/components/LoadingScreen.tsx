import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  const [phase, setPhase] = useState('Searching...');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('Building journey...'), 400);
    const timer2 = setTimeout(() => setPhase('Ranking routes...'), 800);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <div className="absolute h-14 w-14 border-2 border-dashed border-blue-200 rounded-full animate-spin [animation-duration:8s]" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mt-6">{phase}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
        Compiling railway graph networks, validating transfer wait caps, and assessing leg reliability indices...
      </p>

      {/* Loading Skeleton indicators */}
      <div className="w-full max-w-md flex flex-col gap-3 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3 animate-pulse shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-200 rounded w-1/4" />
            </div>
            <div className="h-3 bg-slate-200 rounded w-2/3" />
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
              <div className="h-3 bg-slate-200 rounded w-1/4" />
              <div className="h-6 bg-slate-200 rounded w-1/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
