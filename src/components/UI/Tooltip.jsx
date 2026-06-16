import { useState, useEffect } from 'react';
import useAppStore from '../../store/useAppStore';

function Tooltip() {
  const hoveredParkName = useAppStore((state) => state.hoveredParkName);
  const mapInstance = useAppStore((state) => state.mapInstance);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!mapInstance) return;

    const handleMouseMove = (e) => {
      setPosition({ x: e.point.x, y: e.point.y });
    };

    mapInstance.on('mousemove', handleMouseMove);

    return () => {
      mapInstance.off('mousemove', handleMouseMove);
    };
  }, [mapInstance]);

  return (
    <div
      className={`pointer-events-none absolute z-30 bg-slate-800/95 text-white text-sm px-3 py-1.5 rounded-lg shadow-xl border border-slate-600/40 backdrop-blur-sm whitespace-nowrap transition-opacity duration-150 ${
        hoveredParkName ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        left: position.x + 14,
        top: position.y - 14,
      }}
    >
      {hoveredParkName}
    </div>
  );
}

export default Tooltip;
