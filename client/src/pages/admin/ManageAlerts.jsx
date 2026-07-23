import { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import alertService from '../../services/alertService';
import { PageLoader } from '../../components/ui/Loader';
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

const ManageAlerts = () => {
  const toast = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [formData, setFormData] = useState(emptyAlertForm);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

  const priorityBadge = (priority) => {
    const map = {
      Emergency: 'badge-danger',
      High: 'badge-warning',
      Medium: 'badge-info',
      Low: 'badge-neutral',
    };
    return map[priority] || 'badge-neutral';
  };

  const columns = [
    {
      header: 'Alert',
      render: (row) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={priorityBadge(row.priority)}>{row.priority}</span>
            <span className={`w-2 h-2 rounded-full ${row.isActive ? 'bg-success-500' : 'bg-gray-300'}`} />
          </div>
          <p className="font-medium text-navy-900 truncate">{row.title}</p>
          <p className="text-xs text-navy-400 truncate mt-0.5">{row.message}</p>
        </div>
      ),
    },
    {
      header: 'Districts',
      render: (row) => (
        <span className="text-sm text-navy-500">
          {row.affectedDistricts?.join(', ') || '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={row.isActive ? 'badge-success' : 'badge-neutral'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Expires',
      render: (row) => <span className="text-sm text-navy-400">{formatDateTime(row.expiresAt)}</span>,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(row);
            }}
            className="btn-primary btn-xs"
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
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Manage Alerts"
        subtitle="Create and manage emergency alerts"
        action="Create Alert"
        onAction={openCreateModal}
      />

      {loading ? (
        <PageLoader text="Loading alerts..." />
      ) : (
        <>
          <p className="text-sm text-navy-400 mb-4">{alerts.length} alert(s) found</p>
          <div className="card overflow-hidden">
            <AdminTable columns={columns} data={alerts} emptyMessage="No alerts found." />
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
              placeholder="Alert title"
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
              placeholder="Alert message"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Priority</label>
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
              placeholder="Comma-separated district names"
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
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/80">
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
