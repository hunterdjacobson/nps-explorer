import React from 'react';
import useAppStore from '../../store/useAppStore';
import HeroSection from './HeroSection';
import StatsRow from './StatsRow';
import AlertsSection from './AlertsSection';
import VisitorCenters from './VisitorCenters';
import ThingsToDoSection from './ThingsToDoSection';
import MediaCarousel from './MediaCarousel';
import { SkeletonCard } from '../UI/LoadingSkeleton';

/**
 * Slide-out detail panel showing full NPS park information (description, images, alerts, centers).
 * Slides in from the left and overlays the map.
 */
export default function DetailPanel() {
  const selectedPark = useAppStore((state) => state.selectedPark);
  const panelOpen = useAppStore((state) => state.panelOpen);
  const closePanel = useAppStore((state) => state.closePanel);

  return (
    <div
      className={`fixed z-20 transition-transform duration-300 ease-in-out bg-slate-900/97 backdrop-blur-md overflow-hidden bottom-0 left-0 right-0 rounded-t-2xl h-[72vh] flex flex-col ${
        panelOpen ? 'translate-y-0' : 'translate-y-full'
      } md:top-0 md:bottom-auto md:left-0 md:right-auto md:h-full md:w-full md:max-w-sm md:rounded-none md:translate-y-0 ${
        panelOpen ? 'md:translate-x-0' : 'md:-translate-x-full'
      }`}
    >
      <div className="md:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
        <div className="w-10 h-1 bg-slate-600 rounded-full" />
      </div>
      {/* Top Bar */}
      <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-slate-700/40 bg-slate-900">
        <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
          NPS Explorer
        </span>
        <button
          onClick={closePanel}
          aria-label="Close panel"
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/60 text-lg leading-none transition-colors cursor-pointer"
        >
          &times;
        </button>
      </div>

      {/* Content Container */}
      <div className="flex-1 overflow-y-auto panel-scroll">
        {selectedPark && selectedPark._loading ? (
          <div className="p-4 space-y-4">
            {/* Header Loader Placeholder */}
            <div className="h-44 bg-slate-700/60 rounded-lg animate-pulse mb-4" />
            <SkeletonCard />
          </div>
        ) : (
          selectedPark && (
            <>
              <HeroSection park={selectedPark} />
              <div className="p-4 space-y-6">
                <StatsRow park={selectedPark} />

                {/* Description */}
                {selectedPark.description && (
                  <div className="space-y-1">
                    <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                      About
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {selectedPark.description}
                    </p>
                  </div>
                )}

                <AlertsSection parkCode={selectedPark.parkCode} />
                <MediaCarousel images={selectedPark.images || []} />
                <VisitorCenters parkCode={selectedPark.parkCode} />
                <ThingsToDoSection parkCode={selectedPark.parkCode} />
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
