import React from 'react';
import visitationData from '../../constants/park_visitation_2025.json';

/**
 * Renders key metadata stats for a selected park (fee, location state, and link to NPS website)
 * as well as 2025 visitation statistics (rank and total visits) when available.
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

  // 3. Visitation data lookup
  const parkCode = park.parkCode?.toLowerCase();
  const visitation = parkCode ? visitationData[parkCode] : null;

  return (
    <div className="space-y-2">
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

      {visitation && (
        <div className="grid grid-cols-2 gap-2">
          {/* Rank */}
          <div className="bg-slate-800/60 border border-slate-700/30 rounded-lg p-3 text-center flex flex-col justify-center">
            <div className="text-amber-400 font-bold text-base">
              #{visitation.rank}
            </div>
            <div className="text-slate-500 text-xs mt-0.5">
              Popularity Rank
            </div>
          </div>

          {/* Visits */}
          <div className="bg-slate-800/60 border border-slate-700/30 rounded-lg p-3 text-center flex flex-col justify-center">
            <div className="text-white font-semibold text-base">
              {visitation.formattedValue}
            </div>
            <div className="text-slate-500 text-xs mt-0.5">
              Annual Visits (2025)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
