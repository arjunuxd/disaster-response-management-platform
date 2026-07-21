import { useEffect, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer } from 'react-leaflet';
import { useMapContext } from '../../context/map/MapContext';
import { MAP_DEFAULTS } from '../../utils/mapConstants';

const MapWrapper = ({ children, className = '' }) => {
  const { setMapRef } = useMapContext();
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      setMapRef(mapRef.current);
    }
  }, [setMapRef]);

  return (
    <LeafletMap
      ref={mapRef}
      center={MAP_DEFAULTS.center}
      zoom={MAP_DEFAULTS.zoom}
      minZoom={MAP_DEFAULTS.minZoom}
      maxZoom={MAP_DEFAULTS.maxZoom}
      zoomControl={false}
      className={className}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {children}
    </LeafletMap>
  );
};

export default MapWrapper;
