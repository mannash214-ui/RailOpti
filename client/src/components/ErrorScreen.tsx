import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorScreen({ title = 'Journey Query Failed', message = 'We encountered an error calculating multi-train itineraries. Please double-check station names and time formats.', onRetry }: ErrorScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl w-fit">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mt-6">{title}</h3>
      <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm mt-6 transition-colors"
        >
          <RefreshCcw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
