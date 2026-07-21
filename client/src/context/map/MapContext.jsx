import { createContext, useContext, useState, useCallback } from 'react';

const MapContext = createContext(null);

export const MapProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    reportType: '',
    severity: '',
    status: '',
    district: '',
    riskLevel: '',
    startDate: '',
    endDate: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [layerVisibility, setLayerVisibility] = useState({
    reports: true,
    riskZones: true,
    shelters: true,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      reportType: '',
      severity: '',
      status: '',
      district: '',
      riskLevel: '',
      startDate: '',
      endDate: '',
    });
    setSearchQuery('');
  }, []);

  const toggleLayer = useCallback((layer) => {
    setLayerVisibility((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const flyTo = useCallback((lat, lng, zoom = 12) => {
    if (mapRef) {
      mapRef.flyTo([lat, lng], zoom, { duration: 1.5 });
    }
  }, [mapRef]);

  const resetView = useCallback(() => {
    if (mapRef) {
      mapRef.flyTo([13.0827, 80.2707], 7, { duration: 1 });
    }
  }, [mapRef]);

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);
        if (mapRef) {
          mapRef.flyTo([latitude, longitude], 13, { duration: 1.5 });
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please enable location access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable. Please check your device settings.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please try again.');
            break;
          default:
            setLocationError('An unknown error occurred while getting your location.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [mapRef]);

  const clearLocationError = useCallback(() => {
    setLocationError(null);
  }, []);

  const value = {
    filters,
    updateFilter,
    resetFilters,
    searchQuery,
    setSearchQuery,
    isPickingLocation,
    setIsPickingLocation,
    pickedLocation,
    setPickedLocation,
    selectedReport,
    setSelectedReport,
    selectedZone,
    setSelectedZone,
    selectedShelter,
    setSelectedShelter,
    mapRef,
    setMapRef,
    layerVisibility,
    toggleLayer,
    isFullscreen,
    setIsFullscreen,
    userLocation,
    setUserLocation,
    locationError,
    clearLocationError,
    isLocating,
    flyTo,
    resetView,
    locateUser,
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within MapProvider');
  }
  return context;
};

export default MapContext;
