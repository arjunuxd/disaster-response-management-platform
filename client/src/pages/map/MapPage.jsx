import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useMapContext } from '../../context/map/MapContext';
import mapService from '../../services/mapService';
import disasterTypeService from '../../services/disasterTypeService';
import MapWrapper from '../../components/map/MapWrapper';
import {
  ReportMarkers,
  RiskZoneLayer,
  ShelterLayer,
  LocationPicker,
  MapLegend,
  MapControls,
} from '../../components/map';
import UserLocationMarker from '../../components/map/UserLocationMarker';
import MapFilters from '../../components/map/MapFilters';
import MapSearchBar from '../../components/map/MapSearchBar';
import RiskZoneFormModal from '../../components/map/RiskZoneFormModal';
import RiskZoneEditModal from '../../components/map/RiskZoneEditModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const MapPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    filters,
    layerVisibility,
    pickedLocation,
    setPickedLocation,
    isPickingLocation,
    setIsPickingLocation,
    isFullscreen,
  } = useMapContext();

  const { isAuthenticated, isAdmin } = useAuth();

  const [reports, setReports] = useState([]);
  const [riskZones, setRiskZones] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [typeColorMap, setTypeColorMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [error, setError] = useState(null);
  const [showRiskZoneForm, setShowRiskZoneForm] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [deletingZone, setDeletingZone] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const reportParams = {
        limit: 200,
        page: 1,
      };
      if (filters.reportType) reportParams.reportType = filters.reportType;
      if (filters.severity) reportParams.severity = filters.severity;
      if (filters.status) reportParams.status = filters.status;
      if (filters.district) reportParams.district = filters.district;
      if (filters.startDate) reportParams.startDate = filters.startDate;
      if (filters.endDate) reportParams.endDate = filters.endDate;

      const [reportsRes, zonesRes, sheltersRes, typesRes] = await Promise.all([
        mapService.getReports(reportParams),
        mapService.getRiskZones(),
        mapService.getShelters(),
        disasterTypeService.getDisasterTypes(),
      ]);

      setReports(reportsRes.data?.data || []);
      setRiskZones(zonesRes.data?.data || []);
      setShelters(sheltersRes.data?.data || []);

      const colorMap = {};
      (typesRes.data?.data || []).forEach((t) => {
        if (t.color) colorMap[t.name] = t.color;
        if (t.color) colorMap[t._id] = t.color;
      });
      setTypeColorMap(colorMap);
    } catch (err) {
      setError('Failed to load map data. Please try again.');
      console.error('Map data error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredZones = filters.riskLevel
    ? riskZones.filter((z) => z.riskLevel === filters.riskLevel)
    : riskZones;

  const reportCount = reports.filter((r) => r.latitude && r.longitude).length;
  const zoneCount = filteredZones.filter((z) => z.latitude && z.longitude).length;
  const shelterCount = shelters.filter((s) => s.latitude && s.longitude).length;

  const handleLocationSelect = (location) => {
    setPickedLocation(null);
    setIsPickingLocation(false);
    navigate('/reports/new', {
      state: {
        latitude: location.lat,
        longitude: location.lng,
        address: location.address,
      },
    });
  };

  const handleEditZone = (zone) => {
    setEditingZone(zone);
  };

  const handleDeleteZone = (zone) => {
    setDeletingZone(zone);
  };

  const confirmDelete = async () => {
    if (!deletingZone) return;
    setDeleteLoading(true);
    try {
      await mapService.deleteRiskZone(deletingZone._id);
      toast.success('Risk zone deleted successfully.');
      setDeletingZone(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete risk zone.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className={`flex flex-col bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : 'h-screen'}`}>
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowSidebar((p) => !p)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="hidden sm:flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </Link>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gray-900">Disaster Map</h1>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{reportCount} reports</span>
              <span>{zoneCount} risk zones</span>
              <span>{shelterCount} shelters</span>
            </div>
          </div>
          <div className="sm:hidden">
            <h1 className="text-sm font-bold text-gray-900">Map</h1>
          </div>
        </div>

        <div className="flex-1 max-w-lg mx-2 sm:mx-4 hidden sm:block">
          <MapSearchBar />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => {
                  setIsPickingLocation(!isPickingLocation);
                  if (isPickingLocation) setPickedLocation(null);
                }}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  isPickingLocation
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-coast-50 text-coast-700 hover:bg-coast-100'
                }`}
              >
                <span className="hidden sm:inline">{isPickingLocation ? 'Cancel Pick' : 'Pick Location'}</span>
                <span className="sm:hidden">{isPickingLocation ? 'Cancel' : 'Pick'}</span>
              </button>

              {isPickingLocation && pickedLocation && (
                <div className="text-[10px] sm:text-xs text-gray-500 bg-gray-50 px-2 sm:px-3 py-1.5 rounded-lg border border-gray-200 hidden sm:block">
                  {pickedLocation.lat.toFixed(5)}, {pickedLocation.lng.toFixed(5)}
                </div>
              )}

              {isAdmin && isPickingLocation && pickedLocation && (
                <button
                  onClick={() => setShowRiskZoneForm(true)}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <span className="hidden sm:inline">Add Risk Zone Here</span>
                  <span className="sm:hidden">Add Zone</span>
                </button>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Sign In to Report
            </Link>
          )}
        </div>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden px-3 py-2 bg-white border-b border-gray-200">
        <MapSearchBar />
      </div>

      {/* Content */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Sidebar */}
        <div
          className={`${
            showSidebar ? 'translate-x-0' : '-translate-x-full'
          } fixed sm:relative z-[999] sm:z-auto w-72 sm:w-72 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto p-3 transition-transform duration-200 ease-in-out h-full`}
        >
          <div className="flex items-center justify-between sm:hidden mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <MapFilters onFilterChange={fetchData} />

          <div className="mt-3 space-y-2">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-blue-800">Map Tips</span>
              </div>
              <p className="text-[11px] text-blue-600 mt-1">
                Click markers to view details. Use the layer controls to toggle visibility.
                {isAuthenticated && isAdmin && ' Use Pick Location to add risk zones.'}
                {!isAuthenticated && ' Sign in to report incidents from the map.'}
              </p>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 rounded-lg p-3 text-xs text-red-600">
                {error}
                <button
                  onClick={fetchData}
                  className="block mt-1 text-red-700 font-medium hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && reports.length === 0 && riskZones.length === 0 && shelters.length === 0 && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-xs text-gray-500">No data available on the map</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar overlay for mobile */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/30 z-[998] sm:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Map */}
        <div className="flex-1 relative">
          <MapWrapper className="w-full h-full">
            {layerVisibility.reports && <ReportMarkers reports={reports} typeColorMap={typeColorMap} />}
            {layerVisibility.riskZones && (
              <RiskZoneLayer
                zones={filteredZones}
                onEditZone={isAdmin ? handleEditZone : undefined}
                onDeleteZone={isAdmin ? handleDeleteZone : undefined}
              />
            )}
            {layerVisibility.shelters && <ShelterLayer shelters={shelters} />}
            <UserLocationMarker />
            {isAuthenticated && <LocationPicker onLocationSelect={handleLocationSelect} />}
            <MapControls reportCount={reportCount} zoneCount={zoneCount} shelterCount={shelterCount} />
            <MapLegend typeColorMap={typeColorMap} />
          </MapWrapper>
        </div>
      </div>

      {/* Create Risk Zone Modal (Admin - from picked location) */}
      <RiskZoneFormModal
        isOpen={showRiskZoneForm}
        onClose={() => setShowRiskZoneForm(false)}
        location={pickedLocation}
        onSuccess={() => {
          fetchData();
          setIsPickingLocation(false);
          setPickedLocation(null);
        }}
      />

      {/* Edit Risk Zone Modal (Admin - from map popup) */}
      <RiskZoneEditModal
        isOpen={!!editingZone}
        onClose={() => setEditingZone(null)}
        zone={editingZone}
        onSuccess={() => {
          fetchData();
          setEditingZone(null);
        }}
      />

      {/* Delete Confirmation */}
      {deletingZone && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
            <div className="p-5">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mx-auto mb-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center">Delete Risk Zone</h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                Are you sure you want to delete &quot;{deletingZone.zoneName}&quot;? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-5 pb-5">
              <button
                onClick={() => setDeletingZone(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
