import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchThingsToDo } from '../../api/npsClient';
import LoadingSkeleton from '../UI/LoadingSkeleton';

/**
 * Displays recommended activities ("Things to Do") at the selected park.
 * Renders up to 6 activities in a 2-column grid.
 */
export default function ThingsToDoSection({ parkCode }) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['thingstodo', parkCode],
    queryFn: ({ signal }) => fetchThingsToDo(parkCode, { limit: 6, signal }),
  });

  return (
    <div>
      <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
        🎯 Things to Do
      </h3>

      {isLoading && (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-800/40 rounded-lg p-2.5 h-[68px] animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && (!activities || activities.length === 0) && (
        <p className="text-slate-500 text-sm">No activities data available</p>
      )}

      {!isLoading && activities && activities.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {activities.slice(0, 6).map((activity) => {
            const cardContent = (
              <div className="flex flex-col h-full justify-between">
                <h4 className="text-white font-medium line-clamp-1 mb-0.5" title={activity.title}>
                  {activity.title}
                </h4>
                <p className="text-slate-500 text-xs line-clamp-2">
                  {activity.shortDescription}
                </p>
              </div>
            );

            const cardClasses = "block bg-slate-800 rounded-lg p-2.5 text-sm transition-colors hover:bg-slate-700/60 text-left w-full h-full";

            if (activity.url) {
              return (
                <a
                  key={activity.id || activity.title}
                  href={activity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClasses}
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <div key={activity.id || activity.title} className={cardClasses}>
                {cardContent}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
