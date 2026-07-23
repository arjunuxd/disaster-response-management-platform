import { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import alertService from '../../services/alertService';
import { PageLoader } from '../../components/ui/Loader';
import FilterDropdown from '../../components/ui/FilterDropdown';
import AdminTable from '../../components/admin/AdminTable';
import PageHeader from '../../components/admin/PageHeader';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import { useToast } from '../../context/ToastContext';
import { PRIORITY_LEVELS } from '../../utils/constants';
import { formatDateTime } from '../../utils';

const emptyAlertForm = {
  title: '',
  message: '',
  priority: 'Medium',
  affectedDistricts: '',
  expiresAt: '',
  isActive: true,
};

const PRIORITY_BADGE = {
  Emergency: 'badge-danger',
  High: 'badge-warning',
  Medium: 'badge-info',
  Low: 'badge-neutral',
};

const PRIORITY_ICON = {
  Emergency: 'bg-danger-500',
  High: 'bg-warning-500',
  Medium: 'bg-primary-500',
  Low: 'bg-navy-300',
};

const ManageAlerts = () => {
  const toast = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [formData, setFormData] = useState(emptyAlertForm);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({ priority: '', isActive: '' });

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await alertService.getAlerts();
      setAlerts(res.data.data);
    } catch {
      toast.error('Failed to load alerts.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const filteredAlerts = alerts.filter((a) => {
    if (filters.priority && a.priority !== filters.priority) return false;
    if (filters.isActive === 'true' && !a.isActive) return false;
    if (filters.isActive === 'false' && a.isActive) return false;
    return true;
  });

  const stats = {
    total: alerts.length,
    active: alerts.filter((a) => a.isActive).length,
    emergency: alerts.filter((a) => a.priority === 'Emergency').length,
    high: alerts.filter((a) => a.priority === 'High').length,
  };

  const openCreateModal = () => {
    setFormData(emptyAlertForm);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const openEditModal = (alert) => {
    setSelectedAlert(alert);
    setFormData({
      title: alert.title,
      message: alert.message,
      priority: alert.priority,
      affectedDistricts: alert.affectedDistricts?.join(', ') || '',
      expiresAt: alert.expiresAt ? (() => {
        const d = new Date(alert.expiresAt);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      })() : '',
      isActive: alert.isActive,
    });
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const payload = {
      ...formData,
      expiresAt: formData.expiresAt ? (() => {
        const d = new Date(formData.expiresAt);
        d.setHours(23, 59, 59, 999);
        return d.toISOString();
      })() : undefined,
      affectedDistricts: formData.affectedDistricts
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean),
    };

    try {
      if (isEditing && selectedAlert) {
        await adminService.updateAlert(selectedAlert._id, payload);
        toast.success('Alert updated successfully.');
      } else {
        await adminService.createAlert(payload);
        toast.success('Alert created successfully.');
      }
      setShowFormModal(false);
      setSelectedAlert(null);
      setFormData(emptyAlertForm);
      fetchAlerts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save alert.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (alert) => {
    try {
      await adminService.updateAlert(alert._id, { isActive: !alert.isActive });
      toast.success(`Alert ${alert.isActive ? 'deactivated' : 'activated'} successfully.`);
      fetchAlerts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle alert.');
    }
  };

  const handleDelete = async () => {
    if (!selectedAlert) return;
    setActionLoading(true);
    try {
      await adminService.deleteAlert(selectedAlert._id);
      toast.success('Alert deleted successfully.');
      setShowDeleteConfirm(false);
      setSelectedAlert(null);
      fetchAlerts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete alert.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Alert',
      render: (row) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_ICON[row.priority] || 'bg-navy-300'}`} />
            <span className={PRIORITY_BADGE[row.priority] || 'badge-neutral'}>{row.priority}</span>
          </div>
          <p className="font-semibold text-navy-900 truncate text-sm">{row.title}</p>
          <p className="text-xs text-navy-400 truncate mt-0.5">{row.message}</p>
        </div>
      ),
    },
    {
      header: 'Districts',
      render: (row) => (
        <div className="max-w-[200px]">
          <div className="flex flex-wrap gap-1">
            {(row.affectedDistricts || []).slice(0, 2).map((d) => (
              <span key={d} className="text-xs bg-navy-50 text-navy-600 px-2 py-0.5 rounded-full">{d}</span>
            ))}
            {row.affectedDistricts?.length > 2 && (
              <span className="text-xs text-navy-400">+{row.affectedDistricts.length - 2}</span>
            )}
          </div>
          {(!row.affectedDistricts || row.affectedDistricts.length === 0) && (
            <span className="text-sm text-navy-400">—</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`badge ${row.isActive ? 'badge-success' : 'badge-neutral'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Expires',
      render: (row) => {
        const isExpired = row.expiresAt && new Date(row.expiresAt) < new Date();
        return (
          <span className={`text-sm ${isExpired ? 'text-danger-500 font-medium' : 'text-navy-400'}`}>
            {row.expiresAt ? formatDateTime(row.expiresAt) : '—'}
            {isExpired && <span className="text-xs ml-1">(expired)</span>}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAlert(row);
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
              handleToggleActive(row);
            }}
            className={row.isActive ? 'btn-ghost btn-xs text-warning-600 hover:bg-warning-50' : 'btn-ghost btn-xs text-success-600 hover:bg-success-50'}
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAlert(row);
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
        title="Manage Alerts"
        subtitle="Create and manage emergency alerts for citizens"
        action="Create Alert"
        onAction={openCreateModal}
      />

      {loading ? (
        <PageLoader text="Loading alerts..." />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Alerts', value: stats.total, color: 'bg-navy-100', textColor: 'text-navy-700' },
              { label: 'Active', value: stats.active, color: 'bg-success-100', textColor: 'text-success-700' },
              { label: 'Emergency', value: stats.emergency, color: 'bg-danger-100', textColor: 'text-danger-700' },
              { label: 'High Priority', value: stats.high, color: 'bg-warning-100', textColor: 'text-warning-700' },
            ].map((stat) => (
              <div key={stat.label} className="card p-4 flex items-center gap-3 shadow-card hover:shadow-card-hover transition-shadow">
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <span className={`text-lg font-bold ${stat.textColor}`}>{stat.value}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
                  <p className="text-xs font-medium text-navy-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-wrap gap-3">
                <FilterDropdown
                  label="Priority"
                  options={PRIORITY_LEVELS}
                  value={filters.priority}
                  onChange={(v) => setFilters((p) => ({ ...p, priority: v }))}
                />
                <FilterDropdown
                  label="Status"
                  options={[
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' },
                  ]}
                  value={filters.isActive}
                  onChange={(v) => setFilters((p) => ({ ...p, isActive: v }))}
                />
              </div>
            </div>
          </div>

          <p className="text-sm text-navy-400">{filteredAlerts.length} alert(s) found</p>
          <div className="card shadow-card overflow-hidden">
            <AdminTable columns={columns} data={filteredAlerts} emptyMessage="No alerts found." />
          </div>
        </>
      )}

      <Modal isOpen={showFormModal} onClose={() => { setShowFormModal(false); setSelectedAlert(null); }} title={isEditing ? 'Edit Alert' : 'Create Alert'} size="lg">
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div>
            <label className="input-label">Title <span className="text-danger-600">*</span></label>
            <input
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              required
              className="input-field"
              placeholder="e.g., Heavy Rainfall Warning - Chennai"
            />
          </div>
          <div>
            <label className="input-label">Message <span className="text-danger-600">*</span></label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
              required
              rows={3}
              className="input-field resize-y"
              placeholder="Detailed alert message for citizens..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Priority <span className="text-danger-600">*</span></label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData((p) => ({ ...p, priority: e.target.value }))}
                className="input-field"
              >
                {PRIORITY_LEVELS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Expiry Date <span className="text-danger-600">*</span></label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData((p) => ({ ...p, expiresAt: e.target.value }))}
                required
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="input-label">Affected Districts <span className="text-danger-600">*</span></label>
            <input
              value={formData.affectedDistricts}
              onChange={(e) => setFormData((p) => ({ ...p, affectedDistricts: e.target.value }))}
              required
              className="input-field"
              placeholder="e.g., Chennai, Kancheepuram, Tiruvallur"
            />
            <p className="text-xs text-navy-400 mt-1.5">Separate multiple districts with commas</p>
          </div>
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-navy-700">Active</label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-navy-100">
            <button
              type="button"
              onClick={() => { setShowFormModal(false); setSelectedAlert(null); }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-primary"
            >
              {actionLoading ? 'Saving...' : isEditing ? 'Update Alert' : 'Create Alert'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedAlert(null); }} title="Alert Details" size="md">
        {selectedAlert && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-navy-100">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                selectedAlert.priority === 'Emergency' ? 'bg-danger-100' :
                selectedAlert.priority === 'High' ? 'bg-warning-100' :
                selectedAlert.priority === 'Medium' ? 'bg-primary-100' : 'bg-navy-100'
              }`}>
                <svg className={`w-6 h-6 ${
                  selectedAlert.priority === 'Emergency' ? 'text-danger-600' :
                  selectedAlert.priority === 'High' ? 'text-warning-600' :
                  selectedAlert.priority === 'Medium' ? 'text-primary-600' : 'text-navy-600'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-navy-900">{selectedAlert.title}</h3>
                <p className="text-sm text-navy-500 mt-0.5">{selectedAlert.message}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Priority</p>
                <span className={PRIORITY_BADGE[selectedAlert.priority] || 'badge-neutral'}>
                  {selectedAlert.priority}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Status</p>
                <span className={`badge ${selectedAlert.isActive ? 'badge-success' : 'badge-neutral'}`}>
                  {selectedAlert.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Expires</p>
                <p className="text-sm font-medium text-navy-800">
                  {selectedAlert.expiresAt ? formatDateTime(selectedAlert.expiresAt) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Created</p>
                <p className="text-sm font-medium text-navy-800">{formatDateTime(selectedAlert.createdAt)}</p>
              </div>
            </div>
            {selectedAlert.affectedDistricts?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-2">Affected Districts</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAlert.affectedDistricts.map((d) => (
                    <span key={d} className="text-xs bg-navy-50 text-navy-600 px-2.5 py-1 rounded-full font-medium">{d}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setSelectedAlert(null); }}
        onConfirm={handleDelete}
        title="Delete Alert"
        message={`Are you sure you want to delete "${selectedAlert?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={actionLoading}
        danger
      />
    </div>
  );
};

export default ManageAlerts;
