import { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import { PageLoader } from '../../components/ui/Loader';
import AdminTable from '../../components/admin/AdminTable';
import PageHeader from '../../components/admin/PageHeader';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import { useToast } from '../../context/ToastContext';
import { RISK_LEVELS, INDIAN_STATES } from '../../utils/constants';
import { formatDate } from '../../utils';

const emptyForm = {
  zoneName: '',
  district: '',
  state: '',
  latitude: '',
  longitude: '',
  riskLevel: 'Moderate',
  description: '',
};

const RISK_BADGE = {
  Critical: 'badge-danger',
  High: 'badge-warning',
  Moderate: 'badge-info',
  Low: 'badge-neutral',
};

const RISK_INDICATOR = {
  Critical: 'bg-danger-500',
  High: 'bg-warning-500',
  Moderate: 'bg-primary-500',
  Low: 'bg-success-500',
};

const ManageRiskZones = () => {
  const toast = useToast();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchZones = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getRiskZones();
      setZones(res.data.data);
    } catch {
      toast.error('Failed to load risk zones.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const openCreateModal = () => {
    setFormData(emptyForm);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const openEditModal = (zone) => {
    setSelectedZone(zone);
    setFormData({
      zoneName: zone.zoneName,
      district: zone.district,
      state: zone.state,
      latitude: zone.latitude,
      longitude: zone.longitude,
      riskLevel: zone.riskLevel,
      description: zone.description || '',
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
    };

    try {
      if (isEditing && selectedZone) {
        await adminService.updateRiskZone(selectedZone._id, payload);
        toast.success('Risk zone updated successfully.');
      } else {
        await adminService.createRiskZone(payload);
        toast.success('Risk zone created successfully.');
      }
      setShowFormModal(false);
      setSelectedZone(null);
      setFormData(emptyForm);
      fetchZones();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save risk zone.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedZone) return;
    setActionLoading(true);
    try {
      await adminService.deleteRiskZone(selectedZone._id);
      toast.success('Risk zone deleted successfully.');
      setShowDeleteConfirm(false);
      setSelectedZone(null);
      fetchZones();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete risk zone.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Zone',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${RISK_INDICATOR[row.riskLevel] || 'bg-navy-300'}`} />
          <div className="min-w-0">
            <p className="font-semibold text-navy-900 truncate text-sm">{row.zoneName}</p>
            <p className="text-xs text-navy-400">{row.district}, {row.state}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Risk Level',
      render: (row) => (
        <span className={`badge ${RISK_BADGE[row.riskLevel] || 'badge-neutral'}`}>
          {row.riskLevel}
        </span>
      ),
    },
    {
      header: 'Coordinates',
      render: (row) => (
        <span className="text-sm text-navy-500 font-mono">
          {row.latitude.toFixed(4)}, {row.longitude.toFixed(4)}
        </span>
      ),
    },
    {
      header: 'Created',
      render: (row) => <span className="text-sm text-navy-500">{formatDate(row.createdAt)}</span>,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedZone(row);
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
              setSelectedZone(row);
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Manage Risk Zones"
        subtitle="Define and manage coastal risk zones"
        action="Create Risk Zone"
        onAction={openCreateModal}
      />

      {loading ? (
        <PageLoader text="Loading risk zones..." />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['Critical', 'High', 'Moderate', 'Low'].map((level) => {
              const count = zones.filter((z) => z.riskLevel === level).length;
              return (
                <div key={level} className="card p-4 flex items-center gap-3 shadow-card hover:shadow-card-hover transition-shadow">
                  <span className={`w-3 h-3 rounded-full shrink-0 ${RISK_INDICATOR[level]}`} />
                  <div>
                    <p className="text-2xl font-bold text-navy-900">{count}</p>
                    <p className="text-xs font-medium text-navy-500">{level} Risk</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card shadow-card overflow-hidden">
            <AdminTable columns={columns} data={zones} emptyMessage="No risk zones found." />
          </div>
        </>
      )}

      <Modal isOpen={showFormModal} onClose={() => { setShowFormModal(false); setSelectedZone(null); }} title={isEditing ? 'Edit Risk Zone' : 'Create Risk Zone'} size="lg">
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div>
            <label className="input-label">Zone Name <span className="text-danger-600">*</span></label>
            <input
              value={formData.zoneName}
              onChange={(e) => setFormData((p) => ({ ...p, zoneName: e.target.value }))}
              required
              className="input-field"
              placeholder="e.g., Chennai Coastal Belt"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">State <span className="text-danger-600">*</span></label>
              <select
                value={formData.state}
                onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
                required
                className="input-field"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">District <span className="text-danger-600">*</span></label>
              <input
                value={formData.district}
                onChange={(e) => setFormData((p) => ({ ...p, district: e.target.value }))}
                required
                className="input-field"
                placeholder="District name"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Latitude <span className="text-danger-600">*</span></label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData((p) => ({ ...p, latitude: e.target.value }))}
                required
                className="input-field"
                placeholder="e.g., 13.0827"
              />
            </div>
            <div>
              <label className="input-label">Longitude <span className="text-danger-600">*</span></label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData((p) => ({ ...p, longitude: e.target.value }))}
                required
                className="input-field"
                placeholder="e.g., 80.2707"
              />
            </div>
          </div>
          <div>
            <label className="input-label">Risk Level</label>
            <select
              value={formData.riskLevel}
              onChange={(e) => setFormData((p) => ({ ...p, riskLevel: e.target.value }))}
              className="input-field"
            >
              {RISK_LEVELS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="input-field resize-y"
              placeholder="Optional description of this risk zone"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-navy-100">
            <button type="button" onClick={() => { setShowFormModal(false); setSelectedZone(null); }} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="btn-primary">
              {actionLoading ? 'Saving...' : isEditing ? 'Update Zone' : 'Create Zone'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedZone(null); }} title="Risk Zone Details" size="md">
        {selectedZone && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-navy-100">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                selectedZone.riskLevel === 'Critical' ? 'bg-danger-100' :
                selectedZone.riskLevel === 'High' ? 'bg-warning-100' :
                selectedZone.riskLevel === 'Moderate' ? 'bg-primary-100' : 'bg-success-100'
              }`}>
                <svg className={`w-6 h-6 ${
                  selectedZone.riskLevel === 'Critical' ? 'text-danger-600' :
                  selectedZone.riskLevel === 'High' ? 'text-warning-600' :
                  selectedZone.riskLevel === 'Moderate' ? 'text-primary-600' : 'text-success-600'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-navy-900">{selectedZone.zoneName}</h3>
                <p className="text-sm text-navy-500">{selectedZone.district}, {selectedZone.state}</p>
              </div>
              <span className={`badge ${RISK_BADGE[selectedZone.riskLevel] || 'badge-neutral'} ml-auto`}>
                {selectedZone.riskLevel}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Latitude</p>
                <p className="text-sm font-medium text-navy-800 font-mono">{selectedZone.latitude}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Longitude</p>
                <p className="text-sm font-medium text-navy-800 font-mono">{selectedZone.longitude}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Created By</p>
                <p className="text-sm font-medium text-navy-800">{selectedZone.createdBy?.fullName || 'Unknown'}</p>
              </div>
            </div>
            {selectedZone.description && (
              <div className="bg-navy-50 rounded-lg p-4">
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-2">Description</p>
                <p className="text-sm text-navy-700 whitespace-pre-wrap leading-relaxed">{selectedZone.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setSelectedZone(null); }}
        onConfirm={handleDelete}
        title="Delete Risk Zone"
        message={`Are you sure you want to delete "${selectedZone?.zoneName}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={actionLoading}
        danger
      />
    </div>
  );
};

export default ManageRiskZones;
