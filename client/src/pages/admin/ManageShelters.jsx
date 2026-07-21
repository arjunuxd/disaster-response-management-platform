import { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import { PageLoader } from '../../components/ui/Loader';
import AdminTable from '../../components/admin/AdminTable';
import PageHeader from '../../components/admin/PageHeader';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import LocationPickerModal from '../../components/map/LocationPickerModal';
import { useToast } from '../../context/ToastContext';
import { INDIAN_STATES, SHELTER_STATUSES } from '../../utils/constants';

const emptyForm = {
  shelterName: '',
  address: '',
  district: '',
  state: '',
  latitude: '',
  longitude: '',
  capacity: '',
  contactNumber: '',
  status: 'Open',
};

const ManageShelters = () => {
  const toast = useToast();
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);

  const fetchShelters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getShelters();
      setShelters(res.data.data);
    } catch {
      toast.error('Failed to load shelters.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchShelters();
  }, [fetchShelters]);

  const openCreateModal = () => {
    setFormData(emptyForm);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const openEditModal = (shelter) => {
    setSelectedShelter(shelter);
    setFormData({
      shelterName: shelter.shelterName,
      address: shelter.address,
      district: shelter.district,
      state: shelter.state || '',
      latitude: shelter.latitude,
      longitude: shelter.longitude,
      capacity: shelter.capacity,
      contactNumber: shelter.contactNumber,
      status: shelter.status,
    });
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const payload = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      capacity: parseInt(formData.capacity, 10),
    };

    try {
      if (isEditing && selectedShelter) {
        await adminService.updateShelter(selectedShelter._id, payload);
        toast.success('Shelter updated successfully.');
      } else {
        await adminService.createShelter(payload);
        toast.success('Shelter created successfully.');
      }
      setShowFormModal(false);
      setSelectedShelter(null);
      setFormData(emptyForm);
      fetchShelters();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save shelter.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (shelter) => {
    const newStatus = shelter.status === 'Open' ? 'Closed' : 'Open';
    try {
      await adminService.updateShelter(shelter._id, { status: newStatus });
      toast.success(`Shelter ${newStatus === 'Open' ? 'opened' : 'closed'} successfully.`);
      fetchShelters();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update shelter status.');
    }
  };

  const handleDelete = async () => {
    if (!selectedShelter) return;
    setActionLoading(true);
    try {
      await adminService.deleteShelter(selectedShelter._id);
      toast.success('Shelter deleted successfully.');
      setShowDeleteConfirm(false);
      setSelectedShelter(null);
      fetchShelters();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete shelter.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredShelters = shelters.filter((s) => {
    const matchesStatus = !filterStatus || s.status === filterStatus;
    const matchesSearch = !filterSearch || s.shelterName.toLowerCase().includes(filterSearch.toLowerCase()) || s.district.toLowerCase().includes(filterSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const columns = [
    {
      header: 'Shelter',
      render: (row) => (
        <div className="min-w-0">
          <p className="font-semibold text-navy-900 truncate text-sm">{row.shelterName}</p>
          <p className="text-xs text-navy-400 truncate mt-0.5">{row.address}</p>
        </div>
      ),
    },
    {
      header: 'District',
      render: (row) => <span className="text-sm text-navy-600">{row.district}</span>,
    },
    {
      header: 'Capacity',
      render: (row) => (
        <span className="text-sm font-medium text-navy-700">{row.capacity}</span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`badge ${row.status === 'Open' ? 'badge-success' : 'badge-danger'}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Contact',
      render: (row) => <span className="text-sm text-navy-500 font-mono">{row.contactNumber}</span>,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedShelter(row);
              setShowDetailModal(true);
            }}
            className="btn-ghost btn-xs"
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(row);
            }}
            className="btn-sm"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(row);
            }}
            className={`btn-xs ${row.status === 'Open' ? 'badge badge-warning border-0' : 'btn-ghost'}`}
          >
            {row.status === 'Open' ? 'Close' : 'Open'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedShelter(row);
              setShowDeleteConfirm(true);
            }}
            className="btn-danger btn-xs"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const handleLocationPick = (loc) => {
    setFormData((p) => ({
      ...p,
      latitude: loc.lat.toString(),
      longitude: loc.lng.toString(),
      address: loc.address || p.address,
      district: loc.district || p.district,
      state: loc.state || p.state,
    }));
    setShowMapPicker(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Manage Emergency Shelters"
        subtitle="Manage emergency shelter locations and capacity"
        action="Create Shelter"
        onAction={openCreateModal}
      />

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Search by name or district..."
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field w-auto min-w-[140px]"
            >
              <option value="">All Status</option>
              {SHELTER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <span className="text-sm text-navy-500 whitespace-nowrap">
              {filteredShelters.length} shelter{filteredShelters.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <PageLoader text="Loading shelters..." />
      ) : (
        <div className="card overflow-hidden shadow-card">
          <AdminTable columns={columns} data={filteredShelters} emptyMessage="No shelters found matching your criteria." />
        </div>
      )}

      <Modal isOpen={showFormModal} onClose={() => { setShowFormModal(false); setSelectedShelter(null); }} title={isEditing ? 'Edit Shelter' : 'Create Shelter'} size="lg">
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div>
            <label className="input-label">Shelter Name <span className="text-danger-600">*</span></label>
            <input
              value={formData.shelterName}
              onChange={(e) => setFormData((p) => ({ ...p, shelterName: e.target.value }))}
              required
              className="input-field"
              placeholder="e.g., Community Center Chennai"
            />
          </div>
          <div>
            <label className="input-label">Address <span className="text-danger-600">*</span></label>
            <input
              value={formData.address}
              onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
              required
              className="input-field"
              placeholder="Full address"
            />
          </div>
          <div>
            <label className="input-label">Location <span className="text-danger-600">*</span></label>
            <div
              onClick={() => setShowMapPicker(true)}
              className="border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all"
            >
              {formData.latitude && formData.longitude ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {formData.district || 'Unknown District'}{formData.state ? `, ${formData.state}` : ''}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{formData.address || `${parseFloat(formData.latitude).toFixed(4)}, ${parseFloat(formData.longitude).toFixed(4)}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>Lat: {parseFloat(formData.latitude).toFixed(5)}</span>
                    <span>Lng: {parseFloat(formData.longitude).toFixed(5)}</span>
                    <span className="text-primary-600 font-medium ml-auto">Click to change</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-600">Pick shelter location on map</p>
                  <p className="text-xs text-gray-400 mt-1">District & state auto-detected from coordinates</p>
                </div>
              )}
            </div>
            {formData.district && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.district && <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">{formData.district}</span>}
                {formData.state && <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">{formData.state}</span>}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Capacity <span className="text-danger-600">*</span></label>
              <input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData((p) => ({ ...p, capacity: e.target.value }))}
                required
                className="input-field"
                placeholder="Max capacity"
              />
            </div>
            <div>
              <label className="input-label">Contact Number <span className="text-danger-600">*</span></label>
              <input
                value={formData.contactNumber}
                onChange={(e) => setFormData((p) => ({ ...p, contactNumber: e.target.value }))}
                required
                className="input-field"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>
          <div>
            <label className="input-label">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
              className="input-field"
            >
              {SHELTER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-navy-100">
            <button type="button" onClick={() => { setShowFormModal(false); setSelectedShelter(null); }} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="btn-primary">
              {actionLoading ? 'Saving...' : isEditing ? 'Update Shelter' : 'Create Shelter'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedShelter(null); }} title="Shelter Details" size="md">
        {selectedShelter && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-navy-100">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-navy-900">{selectedShelter.shelterName}</h3>
                <p className="text-sm text-navy-500">{selectedShelter.address}</p>
              </div>
              <span className={`badge ${selectedShelter.status === 'Open' ? 'badge-success' : 'badge-danger'} ml-auto`}>
                {selectedShelter.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">State</p>
                <p className="text-sm font-medium text-navy-800">{selectedShelter.state || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">District</p>
                <p className="text-sm font-medium text-navy-800">{selectedShelter.district}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Capacity</p>
                <p className="text-sm font-medium text-navy-800">{selectedShelter.capacity} people</p>
              </div>
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Contact</p>
                <p className="text-sm font-medium text-navy-800 font-mono">{selectedShelter.contactNumber}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Latitude</p>
                <p className="text-sm font-medium text-navy-800 font-mono">{selectedShelter.latitude}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Longitude</p>
                <p className="text-sm font-medium text-navy-800 font-mono">{selectedShelter.longitude}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setSelectedShelter(null); }}
        onConfirm={handleDelete}
        title="Delete Shelter"
        message={`Are you sure you want to delete "${selectedShelter?.shelterName}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={actionLoading}
        danger
      />

      {showMapPicker && (
        <LocationPickerModal
          initialLat={formData.latitude ? parseFloat(formData.latitude) : null}
          initialLng={formData.longitude ? parseFloat(formData.longitude) : null}
          onSelect={handleLocationPick}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </div>
  );
};

export default ManageShelters;
