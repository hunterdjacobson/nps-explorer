import React from 'react';

/**
 * Renders a set of pulse animation bars to represent content loading.
 */
export default function LoadingSkeleton({ lines = 3, height = 'h-4' }) {
  return (
    <>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-slate-700/60 rounded animate-pulse mb-2 ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </>
  );
}

/**
 * Renders a full card loading skeleton, including an image skeleton block
 * followed by detail text lines.
 */
export function SkeletonCard() {
  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <div className="h-40 bg-slate-700/60 rounded-lg animate-pulse mb-3" />
      <LoadingSkeleton lines={3} />
    </div>
  );
}
