import { memo } from 'react';

const MapLegend = ({ typeColorMap = {} }) => {
  const reportTypes = Object.keys(typeColorMap).filter((name) => !name.match(/^[a-f0-9]{24}$/i));

  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-xl shadow-lg border border-gray-200 p-3 hidden sm:block max-w-[200px]">
      <details open>
        <summary className="text-xs font-semibold text-gray-700 cursor-pointer select-none flex items-center gap-1.5 mb-2">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Map Legend
        </summary>
        <div className="space-y-2.5">
          {reportTypes.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Reports</p>
              <div className="space-y-1">
                {reportTypes.slice(0, 8).map((name) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: typeColorMap[name] }} />
                    <span className="text-[11px] text-gray-600 truncate">{name}</span>
                  </div>
                ))}
                {reportTypes.length > 8 && (
                  <p className="text-[10px] text-gray-400">+{reportTypes.length - 8} more types</p>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-2">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Risk Zones</p>
            <div className="space-y-1">
              {[
                { level: 'Low', color: '#22c55e', border: '#16a34a' },
                { level: 'Moderate', color: '#eab308', border: '#ca8a04' },
                { level: 'High', color: '#f97316', border: '#ea580c' },
                { level: 'Critical', color: '#ef4444', border: '#dc2626' },
              ].map(({ level, color, border }) => (
                <div key={level} className="flex items-center gap-2">
                  <div className="w-3 h-2 rounded" style={{ backgroundColor: `${color}40`, border: `1px solid ${border}` }} />
                  <span className="text-[11px] text-gray-600">{level}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm flex-shrink-0 bg-green-600 flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="8" width="16" height="14" fill="#fff" rx="2"/>
                </svg>
              </div>
              <span className="text-[11px] text-gray-600">Shelter</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 rounded-full flex-shrink-0 bg-blue-600 border-2 border-white shadow-sm" />
              <span className="text-[11px] text-gray-600">Your Location</span>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
};

export default memo(MapLegend);
