import { useEffect, useCallback, useState } from 'react';
import { useMap, Marker, Popup } from 'react-leaflet';
import { pickIcon } from '../../utils/leafletIcon';
import { useMapContext } from '../../context/map/MapContext';

const LocationPicker = ({ onLocationSelect }) => {
  const { isPickingLocation, pickedLocation, setPickedLocation } = useMapContext();
  const map = useMap();
  const [reverseGeocode, setReverseGeocode] = useState(null);
  const [geocoding, setGeocoding] = useState(false);

  const handleClick = useCallback(
    (e) => {
      if (isPickingLocation) {
        setPickedLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        setReverseGeocode(null);

        setGeocoding(true);
        fetch(`/api/geocode/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&zoom=18`)
          .then((res) => res.json())
          .then((data) => {
            if (data.display_name) {
              setReverseGeocode(data.display_name);
            }
          })
          .catch(() => {})
          .finally(() => setGeocoding(false));
      }
    },
    [isPickingLocation, setPickedLocation]
  );

  useEffect(() => {
    if (!map) return;
    if (isPickingLocation) {
      map.getContainer().style.cursor = 'crosshair';
      map.on('click', handleClick);
    } else {
      map.getContainer().style.cursor = '';
    }
    return () => {
      map.getContainer().style.cursor = '';
      map.off('click', handleClick);
    };
  }, [map, isPickingLocation, handleClick]);

  if (!isPickingLocation || !pickedLocation) return null;

  return (
    <Marker position={[pickedLocation.lat, pickedLocation.lng]} icon={pickIcon}>
      <Popup>
        <div className="min-w-[200px] max-w-[280px]">
          <p className="text-xs font-medium text-gray-900 mb-1">Selected Location</p>
          <p className="text-[11px] text-gray-500 mb-1">
            {pickedLocation.lat.toFixed(5)}, {pickedLocation.lng.toFixed(5)}
          </p>
          {geocoding && (
            <p className="text-[10px] text-gray-400 italic">Looking up address...</p>
          )}
          {reverseGeocode && !geocoding && (
            <p className="text-[10px] text-gray-500 mb-2 line-clamp-2">{reverseGeocode}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLocationSelect?.({
                  lat: pickedLocation.lat,
                  lng: pickedLocation.lng,
                  address: reverseGeocode || '',
                });
              }}
              className="px-3 py-1 text-[11px] font-medium bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              Use for Report
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(
                  `${pickedLocation.lat.toFixed(5)}, ${pickedLocation.lng.toFixed(5)}`
                );
              }}
              className="px-3 py-1 text-[11px] font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Copy Coords
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default LocationPicker;
