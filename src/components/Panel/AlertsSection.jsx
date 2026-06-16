import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchParkAlerts } from '../../api/npsClient';
import LoadingSkeleton from '../UI/LoadingSkeleton';

const BORDER_COLOR_MAP = {
  Closure: 'border-red-500',
  Danger: 'border-red-400',
  Caution: 'border-yellow-500',
  Information: 'border-blue-400',
};

const BADGE_COLOR_MAP = {
  Closure: 'bg-red-900/60 text-red-300',
  Danger: 'bg-red-900/60 text-red-300',
  Caution: 'bg-yellow-900/60 text-yellow-300',
  Information: 'bg-blue-900/60 text-blue-300',
};

/**
 * Displays active NPS-managed alerts (closures, danger warnings, cautions, info alerts)
 * for the currently selected park.
 */
export default function AlertsSection({ parkCode }) {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', parkCode],
    queryFn: ({ signal }) => fetchParkAlerts(parkCode, { signal }),
    staleTime: 2 * 60 * 1000,
  });

  return (
    <div>
      <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
        🔔 Active Alerts
      </h3>

      {isLoading && <LoadingSkeleton lines={2} height="h-10" />}

      {!isLoading && (!alerts || alerts.length === 0) && (
        <p className="text-green-400 text-sm">✅ No active alerts</p>
      )}

      {!isLoading && alerts && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => {
            const category = alert.category || 'Other';
            const borderColor = BORDER_COLOR_MAP[category] || 'border-slate-500';
            const badgeColor = BADGE_COLOR_MAP[category] || 'bg-slate-700 text-slate-300';

            return (
              <div
                key={alert.id || alert.title}
                className={`border-l-4 ${borderColor} pl-3 py-1`}
              >
                <div>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${badgeColor}`}>
                    {category}
                  </span>
                </div>
                <div className="text-white text-sm font-medium mt-0.5 line-clamp-1" title={alert.title}>
                  {alert.title}
                </div>
                <div className="text-slate-400 text-xs mt-0.5 line-clamp-2" title={alert.description}>
                  {alert.description}
                </div>
                {alert.url && (
                  <div className="mt-1">
                    <a
                      href={alert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 text-xs hover:underline"
                    >
                      Read more →
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
