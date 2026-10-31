import React from 'react';
import { Sparkles } from 'lucide-react';

export const RecommendationBadge = ({ score, reason }) => {
  const getBadgeColor = (val) => {
    if (val >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (val >= 70) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${getBadgeColor(score)}`}>
          <Sparkles className="w-3 h-3" />
          {score}% AI Match
        </span>
      </div>
      {reason && (
        <p className="text-[11px] text-slate-500 font-medium italic line-clamp-2">
          "{reason}"
        </p>
      )}
    </div>
  );
};
