import { useState, useEffect } from 'react';

/**
 * Renders an interactive photo carousel for the selected park with arrow navigations
 * and a thumbnail strip at the bottom.
 */
export default function MediaCarousel({ images }) {
  if (!images || images.length === 0) return null;

  const [activeIndex, setActiveIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const displayImages = images.slice(0, 8);
  const currentImage = displayImages[activeIndex];

  // Reset loaded state when active index changes
  useEffect(() => {
    setImageLoaded(false);
  }, [activeIndex]);

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
      <div className="relative rounded-lg overflow-hidden h-48 bg-slate-800">
        <img
          src={currentImage.url}
          alt={currentImage.title || 'Park photo'}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />

        {displayImages.length > 1 && (
          <>
            {/* Prev Button */}
            <button
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-900/70 hover:bg-slate-900/90 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors text-sm cursor-pointer"
            >
              ‹
            </button>
            {/* Next Button */}
            <button
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900/70 hover:bg-slate-900/90 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors text-sm cursor-pointer"
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
    </div>
  );
}
