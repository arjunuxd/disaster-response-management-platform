import { useMap } from 'react-leaflet';
import { useMapContext } from '../../context/map/MapContext';

const MapControls = ({ reportCount = 0, zoneCount = 0, shelterCount = 0 }) => {
  const {
    layerVisibility,
    toggleLayer,
    isFullscreen,
    setIsFullscreen,
    locateUser,
    isLocating,
    locationError,
    clearLocationError,
    userLocation,
  } = useMapContext();
  const map = useMap();

  const handleLocate = () => {
    if (locationError) clearLocationError();
    locateUser();
  };

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const handleResetView = () => map.flyTo([13.0827, 80.2707], 7, { duration: 1 });

  const locateIcon = isLocating ? (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const controlGroups = [
    {
      id: 'zoom',
      buttons: [
        { label: '+', onClick: handleZoomIn, title: 'Zoom in' },
        { label: '-', onClick: handleZoomOut, title: 'Zoom out' },
      ],
    },
    {
      id: 'actions',
      buttons: [
        {
          icon: locateIcon,
          onClick: handleLocate,
          title: userLocation ? 'Update my location' : 'My location',
          active: !!userLocation,
        },
        {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
          onClick: handleResetView,
          title: 'Reset view',
        },
        {
          icon: isFullscreen ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          ),
          onClick: () => setIsFullscreen((p) => !p),
          title: isFullscreen ? 'Exit fullscreen' : 'Fullscreen',
        },
      ],
    },
  ];

  return (
    <>
      {locationError && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] bg-red-50 border border-red-200 rounded-lg shadow-lg px-4 py-3 max-w-sm">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="flex-1">
              <p className="text-xs text-red-700 font-medium">{locationError}</p>
            </div>
            <button
              onClick={clearLocationError}
              className="text-red-400 hover:text-red-600"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {controlGroups.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            {group.buttons.map((btn) => (
              <button
                key={btn.title}
                onClick={btn.onClick}
                title={btn.title}
                className={`w-11 h-11 flex items-center justify-center border-b border-gray-100 last:border-b-0 text-sm font-medium transition-colors ${
                  btn.active
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {btn.icon || btn.label}
              </button>
            ))}
          </div>
        ))}

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1">
          <div className="space-y-0.5">
            {[
              { key: 'reports', label: 'Reports', color: 'text-blue-600', dot: 'bg-blue-600', count: reportCount },
              { key: 'riskZones', label: 'Risk Zones', color: 'text-orange-500', dot: 'bg-orange-500', count: zoneCount },
              { key: 'shelters', label: 'Shelters', color: 'text-green-600', dot: 'bg-green-600', count: shelterCount },
            ].map(({ key, label, dot, count }) => (
              <button
                key={key}
                onClick={() => toggleLayer(key)}
                className={`flex items-center gap-1.5 w-full px-2 py-1.5 rounded text-xs transition-colors ${
                  layerVisibility[key]
                    ? 'bg-gray-50 text-gray-700'
                    : 'text-gray-400'
                }`}
                title={label}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    layerVisibility[key] ? dot : 'bg-gray-300'
                  }`}
                />
                <span className="truncate">{label}</span>
                <span className="ml-auto text-[10px] tabular-nums opacity-60">{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MapControls;
