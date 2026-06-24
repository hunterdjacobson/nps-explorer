import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders an interactive photo carousel for the selected park with arrow navigations,
 * a thumbnail strip at the bottom, and a fullscreen lightbox modal.
 */
export default function MediaCarousel({ images }) {
  if (!images || images.length === 0) return null;

  const [activeIndex, setActiveIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const displayImages = images.slice(0, 8);
  const currentImage = displayImages[activeIndex];

  // Reset loaded state when active index changes
  useEffect(() => {
    setImageLoaded(false);
  }, [activeIndex]);

  // Handle keyboard events when lightbox is open
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, displayImages.length]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div>
      <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
        📸 Photos
      </h3>

      {/* Main Image Container */}
      <div 
        onClick={() => setIsLightboxOpen(true)}
        className="relative rounded-lg overflow-hidden h-48 bg-slate-800 group cursor-zoom-in shadow-md"
      >
        <img
          src={currentImage.url}
          alt={currentImage.title || 'Park photo'}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />

        {/* Zoom Hint Icon on Hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-sm p-2.5 rounded-full border border-slate-700/50 text-white/95 shadow-xl scale-90 group-hover:scale-100 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </div>
        </div>

        {displayImages.length > 1 && (
          <>
            {/* Prev Button */}
            <button
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-900/70 hover:bg-slate-900/90 hover:scale-110 text-white rounded-full w-7 h-7 flex items-center justify-center transition-all text-sm cursor-pointer z-10"
            >
              ‹
            </button>
            {/* Next Button */}
            <button
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900/70 hover:bg-slate-900/90 hover:scale-110 text-white rounded-full w-7 h-7 flex items-center justify-center transition-all text-sm cursor-pointer z-10"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Caption & Credit */}
      {currentImage.caption && (
        <p className="text-slate-500 text-xs italic mt-1.5 line-clamp-1" title={currentImage.caption}>
          {currentImage.caption}
        </p>
      )}
      {currentImage.credit && (
        <p className="text-slate-600 text-xs mt-0.5">
          Credit: {currentImage.credit}
        </p>
      )}

      {/* Thumbnail Strip */}
      {displayImages.length > 1 && (
        <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 panel-scroll">
          {displayImages.map((img, i) => (
            <img
              key={img.url || i}
              src={img.url}
              alt={img.title || `Thumbnail ${i + 1}`}
              loading="lazy"
              onClick={() => setActiveIndex(i)}
              className={`w-16 h-10 object-cover rounded cursor-pointer flex-shrink-0 transition-all ${
                i === activeIndex
                  ? 'ring-2 ring-amber-400 opacity-100 scale-95'
                  : 'opacity-60 hover:opacity-100'
              }`}
            />
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && createPortal(
        <div 
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4 transition-all duration-300 animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 bg-slate-900/60 border border-slate-700/50 hover:bg-slate-800 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 z-[110]"
            aria-label="Close lightbox"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Lightbox Content Area */}
          <div 
            className="relative max-w-5xl max-h-[75vh] w-full flex items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage.url}
              alt={currentImage.title || 'Park photo'}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl border border-slate-800/80 animate-zoomIn"
            />

            {displayImages.length > 1 && (
              <>
                {/* Prev Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
                  }}
                  className="absolute -left-2 md:-left-16 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all cursor-pointer border border-slate-800/80 shadow-lg hover:scale-105 hover:text-amber-400 z-10"
                  aria-label="Previous image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                {/* Next Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute -right-2 md:-right-16 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all cursor-pointer border border-slate-800/80 shadow-lg hover:scale-105 hover:text-amber-400 z-10"
                  aria-label="Next image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Description Overlay */}
          <div 
            className="max-w-2xl text-center mt-6 select-text z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {currentImage.title && (
              <h4 className="text-white text-lg font-semibold mb-1">
                {currentImage.title}
              </h4>
            )}
            {currentImage.caption && (
              <p className="text-slate-300 text-sm italic leading-relaxed">
                {currentImage.caption}
              </p>
            )}
            {currentImage.credit && (
              <p className="text-slate-500 text-xs mt-1.5">
                Photo Credit: {currentImage.credit}
              </p>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
