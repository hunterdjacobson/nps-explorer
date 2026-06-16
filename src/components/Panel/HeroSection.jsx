import React from 'react';
import { getColorForDesignation } from '../../constants/designations';

/**
 * Renders the top image banner, title, designation badge, and state location
 * for the selected park inside the detail panel.
 */
export default function HeroSection({ park }) {
  if (!park) return null;

  const imageUrl = park.images?.[0]?.url;
  const style = imageUrl ? { backgroundImage: `url(${imageUrl})` } : {};
  const bgClass = imageUrl ? 'bg-cover bg-center' : 'bg-slate-800';

  return (
    <div className={`h-56 relative overflow-hidden ${bgClass}`} style={style}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-slate-900" />

      {/* Text block */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
        <h2 className="text-xl font-bold text-white leading-tight line-clamp-2">
          {park.fullName}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {park.designation && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-black/40 border border-white/20 text-white mt-1">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: getColorForDesignation(park.designation) }}
              />
              {park.designation}
            </span>
          )}

          {park.states && (
            <span className="text-slate-400 text-xs mt-0.5">
              📍 {park.states}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
