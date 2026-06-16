import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchVisitorCenters } from '../../api/npsClient';
import LoadingSkeleton from '../UI/LoadingSkeleton';

/**
 * Displays visitor centers located within the selected park, including their
 * operating hours for today and Google Maps directions links.
 */
export default function VisitorCenters({ parkCode }) {
  const { data: visitorCenters, isLoading } = useQuery({
    queryKey: ['visitorcenters', parkCode],
    queryFn: ({ signal }) => fetchVisitorCenters(parkCode, { signal }),
  });

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  return (
    <div>
      <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
        🏛️ Visitor Centers
      </h3>

      {isLoading && <LoadingSkeleton lines={3} height="h-12" />}

      {!isLoading && (!visitorCenters || visitorCenters.length === 0) && (
        <p className="text-slate-500 text-sm">No visitor center data available</p>
      )}

      {!isLoading && visitorCenters && visitorCenters.length > 0 && (
        <div className="space-y-3">
          {visitorCenters.slice(0, 4).map((vc) => {
            const hours = vc.operatingHours?.[0]?.standardHours?.[today];
            const displayHours = hours || 'Hours vary';

            return (
              <div
                key={vc.id || vc.name}
                className="border border-slate-700/50 rounded-lg p-3 space-y-1 bg-slate-800/30"
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-white text-sm font-medium leading-tight">
                    {vc.name}
                  </h4>
                  {vc.isPassportStampLocation === 'true' && (
                    <span className="text-[10px] font-semibold bg-amber-900/50 text-amber-300 px-1.5 py-0.5 rounded flex-shrink-0 uppercase tracking-wider">
                      📮 Stamp
                    </span>
                  )}
                </div>

                <p className="text-slate-400 text-xs">
                  Today: <span className="text-slate-300 font-medium">{displayHours}</span>
                </p>

                {vc.lat !== undefined && vc.lat !== null && (
                  <div className="pt-1">
                    <a
                      href={`https://maps.google.com/?q=${vc.lat},${vc.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 text-xs hover:underline inline-block"
                    >
                      Directions →
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
