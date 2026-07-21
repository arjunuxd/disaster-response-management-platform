import { Marker, Popup, Circle } from 'react-leaflet';
import { useMapContext } from '../../context/map/MapContext';
import { userLocationIcon } from '../../utils/leafletIcon';

const UserLocationMarker = () => {
  const { userLocation } = useMapContext();

  if (!userLocation) return null;

  return (
    <>
      <Circle
        center={[userLocation.lat, userLocation.lng]}
        radius={100}
        pathOptions={{
          color: '#2563eb',
          fillColor: '#2563eb',
          fillOpacity: 0.1,
          weight: 1,
          dashArray: '4 4',
        }}
      />
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
        <Popup>
          <div className="min-w-[160px]">
            <p className="text-xs font-medium text-gray-900 mb-1">Your Location</p>
            <p className="text-[11px] text-gray-500">
              {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
            </p>
          </div>
        </Popup>
      </Marker>
    </>
  );
};

export default UserLocationMarker;
