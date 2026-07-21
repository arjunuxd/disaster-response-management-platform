import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const defaultCenter = [20.5937, 78.9629];
const defaultZoom = 5;

function DraggableMarker({ position, onDragEnd }) {
  const markerRef = useRef(null);

  return (
    <Marker
      draggable
      position={position}
      icon={markerIcon}
      ref={markerRef}
      eventHandlers={{
        dragend: () => {
          const marker = markerRef.current;
          if (marker) {
            const { lat, lng } = marker.getLatLng();
            onDragEnd({ lat, lng });
          }
        },
      }}
    />
  );
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14);
  }, [center, map]);
  return null;
}

function SearchControl({ onSearch }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [dropdownPos, setDropdownPos] = useState(null);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, []);

  const handleSearch = useCallback((q) => {
    setQuery(q);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!q || q.length < 3) { setResults([]); setOpen(false); return; }
    updatePosition();
    setOpen(true);
    timeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/geocode/search?q=${encodeURIComponent(q)}&limit=5`
        );
        const data = await res.json();
        setResults(data);
        if (data.length === 0) {
          setDropdownPos((prev) => prev ? { ...prev, noResults: true } : prev);
        }
      } catch { setResults([]); }
      setSearching(false);
    }, 400);
  }, [updatePosition]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        inputRef.current && !inputRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
        setResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectResult = (r) => {
    const district = r.address?.district || r.address?.state_district || r.address?.county || r.address?.city || r.address?.town || r.address?.suburb || r.address?.village || '';
    const state = r.address?.state || '';
    onSearch({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), address: r.display_name, district, state });
    setQuery(r.display_name?.substring(0, 80) || '');
    setResults([]);
    setOpen(false);
  };

  const dropdown = open && dropdownPos && (
    createPortal(
      <div
        ref={dropdownRef}
        className="bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
        style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 99999 }}
      >
        {searching && (
          <div className="px-4 py-3 text-xs text-gray-400 flex items-center gap-2">
            <div className="animate-spin h-3.5 w-3.5 border-2 border-primary-500 border-t-transparent rounded-full" />
            Searching...
          </div>
        )}
        {!searching && results.length === 0 && query.length >= 3 && (
          <div className="px-4 py-3 text-xs text-gray-400">No results found</div>
        )}
        {results.map((r, i) => (
          <button
            key={i}
            onMouseDown={(e) => { e.preventDefault(); selectResult(r); }}
            className="w-full text-left px-4 py-2.5 hover:bg-primary-50 border-b border-gray-100 last:border-0 text-xs text-gray-700 transition-colors"
          >
            {r.display_name}
          </button>
        ))}
      </div>,
      document.body
    )
  );

  return (
    <div className="relative">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => { if (results.length > 0) { updatePosition(); setOpen(true); } }}
          placeholder="Search location (e.g. Chennai, Mumbai, Delhi)..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>
      {dropdown}
    </div>
  );
}

const LocationPickerModal = ({ initialLat, initialLng, onSelect, onClose }) => {
  const [position, setPosition] = useState(
    initialLat && initialLng ? [initialLat, initialLng] : defaultCenter
  );
  const [address, setAddress] = useState('');
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const [reverseGeocodeData, setReverseGeocodeData] = useState({ district: '', state: '' });

  const doReverseGeocode = useCallback(async (lat, lng) => {
    setReverseGeocoding(true);
    try {
      const res = await fetch(
        `/api/geocode/reverse?lat=${lat}&lon=${lng}&zoom=18`
      );
      const data = await res.json();
      if (data.display_name) setAddress(data.display_name);
      if (data.address) {
        const a = data.address;
        const district = a.district || a.state_district || a.county || a.city || a.town || a.suburb || a.village || '';
        const state = a.state || '';
        setReverseGeocodeData({ district, state });
      }
    } catch { /* silent */ }
    setReverseGeocoding(false);
  }, []);

  const handleMapClick = useCallback(({ lat, lng }) => {
    setPosition([lat, lng]);
    doReverseGeocode(lat, lng);
  }, [doReverseGeocode]);

  const handleDragEnd = useCallback(({ lat, lng }) => {
    setPosition([lat, lng]);
    doReverseGeocode(lat, lng);
  }, [doReverseGeocode]);

  const handleSearchSelect = useCallback(({ lat, lng, address: addr, district, state }) => {
    setPosition([lat, lng]);
    setAddress(addr || '');
    if (district || state) {
      setReverseGeocodeData({ district: district || '', state: state || '' });
    } else {
      doReverseGeocode(lat, lng);
    }
  }, [doReverseGeocode]);

  const handleConfirm = () => {
    onSelect({ lat: position[0], lng: position[1], address, district: reverseGeocodeData.district, state: reverseGeocodeData.state });
  };

  const hasDistrictState = reverseGeocodeData.district && reverseGeocodeData.state;
  const canConfirm = hasDistrictState && !reverseGeocoding;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Pick Location</h3>
            <p className="text-xs text-gray-500 mt-0.5">Search, click on map, or drag the marker</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 pt-4">
          <SearchControl onSearch={handleSearchSelect} />
        </div>

        <div className="flex-1 min-h-0 px-5 py-3">
          <div className="h-80 rounded-lg overflow-hidden border border-gray-200">
            <MapContainer
              center={position}
              zoom={initialLat ? 14 : defaultZoom}
              className="w-full h-full"
              style={{ background: '#e5e7eb' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onMapClick={handleMapClick} />
              <MapRecenter center={position} />
              <DraggableMarker position={position} onDragEnd={handleDragEnd} />
            </MapContainer>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Latitude:</span>
                <span className="ml-1 font-medium text-gray-900">{position[0].toFixed(5)}</span>
              </div>
              <div>
                <span className="text-gray-500">Longitude:</span>
                <span className="ml-1 font-medium text-gray-900">{position[1].toFixed(5)}</span>
              </div>
            </div>
            {reverseGeocoding && (
              <p className="text-[10px] text-gray-400 italic mt-2">Looking up district & state...</p>
            )}
            {!reverseGeocoding && hasDistrictState && (
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[11px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">{reverseGeocodeData.district}</span>
                <span className="text-[11px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">{reverseGeocodeData.state}</span>
              </div>
            )}
            {!reverseGeocoding && !hasDistrictState && address && (
              <p className="text-[10px] text-amber-600 mt-2">District & state could not be detected. Try clicking a more specific location on the map.</p>
            )}
            {address && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{address}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Address (editable)</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Address will be auto-filled, or type manually"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                canConfirm
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {reverseGeocoding ? 'Detecting...' : 'Confirm Location'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
