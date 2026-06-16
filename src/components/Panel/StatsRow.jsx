import React from 'react';

/**
 * Renders key metadata stats for a selected park (fee, location state, and link to NPS website)
 * in a responsive column grid.
 */
export default function StatsRow({ park }) {
  if (!park) return null;

  // 1. Entrance Fee calculation
  const feeInfo = park.entranceFees?.[0];
  const feeValue = feeInfo?.cost !== undefined && feeInfo?.cost !== null && feeInfo?.cost !== ''
    ? `$${feeInfo.cost}`
    : 'Free';

  // 2. States labels calculation
  const statesValue = park.states || 'N/A';
  const statesLabel = park.states?.includes(',') ? 'States' : 'State';

  return (
    <div className="grid grid-cols-3 gap-2">
      {/* Entrance Fee */}
      <div className="bg-slate-800 rounded-lg p-3 text-center">
        <div className="text-white font-semibold text-base truncate" title={feeValue}>
          {feeValue}
        </div>
        <div className="text-slate-500 text-xs mt-0.5">
          Entry Fee
        </div>
      </div>

      {/* State(s) */}
      <div className="bg-slate-800 rounded-lg p-3 text-center">
        <div className="text-white font-semibold text-base truncate" title={statesValue}>
          {statesValue}
        </div>
        <div className="text-slate-500 text-xs mt-0.5">
          {statesLabel}
        </div>
      </div>

      {/* NPS Official Link */}
      <a
        href={park.url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-slate-800 rounded-lg p-3 text-center hover:bg-slate-700 transition-colors block"
      >
        <div className="text-white font-semibold text-base">
          ↗ Visit
        </div>
        <div className="text-slate-500 text-xs mt-0.5">
          NPS.gov
        </div>
      </a>
    </div>
  );
}
