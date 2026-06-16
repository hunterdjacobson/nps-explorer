import { memo } from 'react';
import useAppStore from '../../store/useAppStore';
import { DESIGNATION_CONFIG, DESIGNATION_ORDER } from '../../constants/designations';

function DesignationFilter() {
  const activeDesignations = useAppStore((state) => state.activeDesignations);
  const toggleDesignation = useAppStore((state) => state.toggleDesignation);
  const enableAllDesignations = useAppStore((state) => state.enableAllDesignations);
  const disableAllDesignations = useAppStore((state) => state.disableAllDesignations);

  return (
    <div className="absolute bottom-6 md:bottom-6 left-4 z-10 bg-slate-900/85 backdrop-blur-sm rounded-xl border border-slate-700/50 p-3 w-64 md:w-72">
      <div className="flex justify-between items-center mb-2">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
          Layers
        </span>
        <div className="flex gap-1">
          <button
            onClick={enableAllDesignations}
            className="text-xs text-slate-500 hover:text-slate-300 px-1.5 py-0.5 rounded hover:bg-slate-700/60 transition-colors"
          >
            All
          </button>
          <button
            onClick={disableAllDesignations}
            className="text-xs text-slate-500 hover:text-slate-300 px-1.5 py-0.5 rounded hover:bg-slate-700/60 transition-colors"
          >
            None
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {DESIGNATION_ORDER.map((key) => {
          const config = DESIGNATION_CONFIG[key];
          if (!config) return null;
          const isActive = activeDesignations.has(key);

          return (
            <button
              key={key}
              onClick={() => toggleDesignation(key)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                isActive
                  ? 'border-transparent text-slate-900 font-semibold'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:border-slate-500'
              }`}
              style={isActive ? { backgroundColor: config.color } : {}}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0 border border-black/20"
                style={{ backgroundColor: config.color }}
              />
              {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(DesignationFilter);
