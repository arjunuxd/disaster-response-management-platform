import { useState, useEffect, useCallback } from 'react';
import disasterTypeService from '../../services/disasterTypeService';
import { PageLoader } from '../../components/ui/Loader';
import AdminTable from '../../components/admin/AdminTable';
import PageHeader from '../../components/admin/PageHeader';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

const DEFAULT_COLORS = [
  { value: '#2563eb', label: 'Blue' },
  { value: '#3b82f6', label: 'Sky Blue' },
  { value: '#7c3aed', label: 'Purple' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#d97706', label: 'Amber' },
  { value: '#92400e', label: 'Brown' },
  { value: '#6b7280', label: 'Gray' },
  { value: '#dc2626', label: 'Red' },
  { value: '#b91c1c', label: 'Dark Red' },
  { value: '#ea580c', label: 'Orange' },
  { value: '#16a34a', label: 'Green' },
  { value: '#0284c7', label: 'Cyan' },
  { value: '#e11d48', label: 'Rose' },
  { value: '#0891b2', label: 'Teal' },
  { value: '#000000', label: 'Black' },
];

const ICON_OPTIONS = [
  'alert-triangle', 'droplets', 'cloud-rain', 'wind', 'waves',
  'mountain', 'mountain-snow', 'activity', 'flame', 'building',
  'car', 'trees', 'cloud-rain-heavy', 'thermometer', 'droplet',
  'heart-pulse', 'flask-round', 'zap', 'cloud-lightning', 'umbrella',
];

const emptyForm = {
  name: '',
  description: '',
  color: '#6b7280',
  icon: 'alert-triangle',
  priority: 5,
  displayOrder: 1,
};

const ManageDisasterTypes = () => {
  const toast = useToast();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await disasterTypeService.getAllDisasterTypes();
      setTypes(res.data.data);
    } catch {
      toast.error('Failed to load disaster types.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const openCreateModal = () => {
    setFormData(emptyForm);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const openEditModal = (type) => {
    setSelectedType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      color: type.color || '#6b7280',
      icon: type.icon || 'alert-triangle',
      priority: type.priority || 5,
      displayOrder: type.displayOrder || 1,
    });
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (isEditing && selectedType) {
        await disasterTypeService.updateDisasterType(selectedType._id, formData);
        toast.success('Disaster type updated successfully.');
      } else {
        await disasterTypeService.createDisasterType(formData);
        toast.success('Disaster type created successfully.');
      }
      setShowFormModal(false);
      setSelectedType(null);
      setFormData(emptyForm);
      fetchTypes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save disaster type.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (type) => {
    try {
      await disasterTypeService.toggleDisasterTypeActive(type._id);
      toast.success(`Disaster type ${type.isActive ? 'disabled' : 'enabled'} successfully.`);
      fetchTypes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle disaster type.');
    }
  };

  const handleDelete = async () => {
    if (!selectedType) return;
    setActionLoading(true);
    try {
      await disasterTypeService.deleteDisasterType(selectedType._id);
      toast.success('Disaster type deleted successfully.');
      setShowDeleteConfirm(false);
      setSelectedType(null);
      fetchTypes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete disaster type.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTypes = types.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Type',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
            style={{ backgroundColor: row.color || '#6b7280' }}
          >
            <span className="text-white text-sm font-bold">{row.name.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-navy-900 truncate text-sm">{row.name}</p>
            {row.description && <p className="text-xs text-navy-400 truncate">{row.description}</p>}
          </div>
        </div>
      ),
    },
    {
      header: 'Color',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className="w-5 h-5 rounded-full border-2 border-white shadow-sm shrink-0"
            style={{ backgroundColor: row.color }}
          />
          <span className="text-xs font-mono text-navy-500">{row.color}</span>
        </div>
      ),
    },
    {
      header: 'Icon',
      render: (row) => <span className="text-sm text-navy-600 font-mono">{row.icon}</span>,
    },
    {
      header: 'Priority',
      render: (row) => (
        <span className="badge badge-neutral">
          {row.priority}
        </span>
      ),
    },
    {
      header: 'Order',
      render: (row) => (
        <span className="text-sm font-mono text-navy-600">
          {row.displayOrder}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`badge ${row.isActive ? 'badge-success' : 'badge-danger'}`}>
          {row.isActive ? 'Enabled' : 'Disabled'}
        </span>
      ),
    },
    {
      header: 'Default',
      render: (row) => (
        row.isDefault ? (
          <span className="badge badge-info">System</span>
        ) : (
          <span className="text-xs text-navy-400">Custom</span>
        )
      ),
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
            className="btn-sm"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(row);
            }}
            className={`btn-xs ${row.isActive ? 'badge badge-warning border-0' : 'badge badge-success border-0'}`}
          >
            {row.isActive ? 'Disable' : 'Enable'}
          </button>
          {!row.isDefault && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedType(row);
                setShowDeleteConfirm(true);
              }}
              className="btn-danger btn-xs"
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Manage Disaster Types"
        subtitle="Configure disaster types used across the platform"
        action="Add Disaster Type"
        onAction={openCreateModal}
      />

      <div className="card p-4 shadow-card">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search disaster types..."
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-navy-500">
              <span className="font-semibold text-navy-700">{filteredTypes.length}</span> of {types.length} types
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <PageLoader text="Loading disaster types..." />
      ) : (
        <div className="card shadow-card overflow-hidden">
          <AdminTable columns={columns} data={filteredTypes} emptyMessage="No disaster types found." />
        </div>
      )}

      <Modal
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setSelectedType(null); }}
        title={isEditing ? 'Edit Disaster Type' : 'Create Disaster Type'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div>
            <label className="input-label">Name <span className="text-danger-600">*</span></label>
            <input
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              required
              className="input-field"
              placeholder="e.g., Flood, Earthquake"
            />
          </div>

          <div>
            <label className="input-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              className="input-field resize-y"
              placeholder="Brief description of this disaster type"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="input-label">Color <span className="text-danger-600">*</span></label>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border-2 border-navy-200 cursor-pointer"
                />
                <span className="text-sm font-mono text-navy-600 bg-navy-50 px-2 py-1 rounded">{formData.color}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, color: c.value }))}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      formData.color === c.value
                        ? 'border-navy-800 scale-110 shadow-md ring-2 ring-navy-200'
                        : 'border-navy-200 hover:scale-105 hover:border-navy-300'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">Icon</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData((p) => ({ ...p, icon: e.target.value }))}
                className="input-field"
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <div className="mt-3 flex items-center gap-3 bg-navy-50 rounded-lg p-3">
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: formData.color }}
                >
                  <span className="text-white text-lg font-bold">{formData.name?.charAt(0) || '?'}</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-navy-500">Preview</p>
                  <p className="text-sm font-semibold text-navy-800">{formData.name || 'Type name'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-navy-50 rounded-lg p-4">
              <label className="input-label mb-3">
                Severity (Priority): <span className="text-primary-600 font-bold">{formData.priority}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => setFormData((p) => ({ ...p, priority: parseInt(e.target.value, 10) }))}
                className="w-full h-2 bg-navy-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-navy-400 mt-2">
                <span>1 (Lowest)</span>
                <span>10 (Highest)</span>
              </div>
            </div>

            <div className="bg-navy-50 rounded-lg p-4">
              <label className="input-label mb-3">
                Display Order: <span className="text-primary-600 font-bold">{formData.displayOrder}</span>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={formData.displayOrder}
                onChange={(e) => setFormData((p) => ({ ...p, displayOrder: parseInt(e.target.value, 10) }))}
                className="w-full h-2 bg-navy-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-navy-400 mt-2">
                <span>1 (First)</span>
                <span>50 (Last)</span>
              </div>
              <p className="text-xs text-navy-400 mt-2">Controls the order in dropdowns and lists.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-navy-100">
            <button
              type="button"
              onClick={() => { setShowFormModal(false); setSelectedType(null); }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-primary"
            >
              {actionLoading ? 'Saving...' : isEditing ? 'Update Type' : 'Create Type'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setSelectedType(null); }}
        onConfirm={handleDelete}
        title="Delete Disaster Type"
        message={`Are you sure you want to delete "${selectedType?.name}"? This may affect existing reports using this type.`}
        confirmText="Delete"
        loading={actionLoading}
        danger
      />
    </div>
  );
};

export default ManageDisasterTypes;
