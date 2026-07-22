import { useState, useEffect, useCallback } from 'react';
import auditLogService from '../../services/auditLogService';
import { PageLoader } from '../../components/ui/Loader';
import Pagination from '../../components/ui/Pagination';
import SearchBox from '../../components/ui/SearchBox';
import FilterDropdown from '../../components/ui/FilterDropdown';
import AdminTable from '../../components/admin/AdminTable';
import PageHeader from '../../components/admin/PageHeader';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../utils';

const MODULE_OPTIONS = [
  { value: 'Auth', label: 'Auth' },
  { value: 'User', label: 'User' },
  { value: 'Report', label: 'Report' },
  { value: 'Alert', label: 'Alert' },
  { value: 'Shelter', label: 'Shelter' },
  { value: 'RiskZone', label: 'Risk Zone' },
  { value: 'DisasterType', label: 'Disaster Type' },
  { value: 'Settings', label: 'Settings' },
];

const STATUS_OPTIONS = [
  { value: 'Success', label: 'Success' },
  { value: 'Failed', label: 'Failed' },
];

const ACTION_OPTIONS = [
  { value: 'Admin Login', label: 'Admin Login' },
  { value: 'Admin Logout', label: 'Admin Logout' },
  { value: 'User Created', label: 'User Created' },
  { value: 'User Deleted', label: 'User Deleted' },
  { value: 'User Updated', label: 'User Updated' },
  { value: 'User Activated', label: 'User Activated' },
  { value: 'User Deactivated', label: 'User Deactivated' },
  { value: 'Role Changed', label: 'Role Changed' },
  { value: 'Report Created', label: 'Report Created' },
  { value: 'Report Updated', label: 'Report Updated' },
  { value: 'Report Deleted', label: 'Report Deleted' },
  { value: 'Report Approved', label: 'Report Approved' },
  { value: 'Report Rejected', label: 'Report Rejected' },
  { value: 'Report Resolved', label: 'Report Resolved' },
  { value: 'Shelter Created', label: 'Shelter Created' },
  { value: 'Shelter Updated', label: 'Shelter Updated' },
  { value: 'Shelter Deleted', label: 'Shelter Deleted' },
  { value: 'Disaster Type Created', label: 'Disaster Type Created' },
  { value: 'Disaster Type Updated', label: 'Disaster Type Updated' },
  { value: 'Disaster Type Deleted', label: 'Disaster Type Deleted' },
  { value: 'Disaster Type Enabled', label: 'Disaster Type Enabled' },
  { value: 'Disaster Type Disabled', label: 'Disaster Type Disabled' },
  { value: 'Settings Updated', label: 'Settings Updated' },
  { value: 'Alert Created', label: 'Alert Created' },
  { value: 'Alert Updated', label: 'Alert Updated' },
  { value: 'Alert Deleted', label: 'Alert Deleted' },
  { value: 'Alert Activated', label: 'Alert Activated' },
  { value: 'Alert Deactivated', label: 'Alert Deactivated' },
  { value: 'Risk Zone Created', label: 'Risk Zone Created' },
  { value: 'Risk Zone Updated', label: 'Risk Zone Updated' },
  { value: 'Risk Zone Deleted', label: 'Risk Zone Deleted' },
];

const MODULE_BADGE = {
  Auth: 'bg-purple-100 text-purple-700 border border-purple-200',
  User: 'bg-primary-100 text-primary-700 border border-primary-200',
  Report: 'bg-primary-100 text-primary-700 border border-primary-200',
  Alert: 'bg-danger-100 text-danger-700 border border-danger-200',
  Shelter: 'bg-success-100 text-success-700 border border-success-200',
  RiskZone: 'bg-warning-100 text-warning-600 border border-warning-200',
  DisasterType: 'bg-navy-100 text-navy-700 border border-navy-200',
  Settings: 'bg-navy-50 text-navy-600 border border-navy-200',
};

const ManageAuditLog = () => {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    module: '',
    status: '',
    startDate: '',
    endDate: '',
    page: 1,
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.action) params.action = filters.action;
      if (filters.module) params.module = filters.module;
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      params.page = filters.page;
      params.limit = 15;

      const res = await auditLogService.getLogs(params);
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleExport = () => {
    const headers = ['Timestamp', 'Admin', 'Action', 'Module', 'Status', 'IP Address', 'Remarks'];
    const rows = logs.map((log) => [
      new Date(log.createdAt).toISOString(),
      log.adminName,
      log.action,
      log.module,
      log.status,
      log.ipAddress || '',
      log.remarks || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `drmp-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Audit log exported successfully.');
  };

  const openDetail = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const columns = [
    {
      header: 'Action',
      render: (row) => (
        <div className="min-w-0">
          <p className="font-semibold text-navy-900 truncate text-sm">{row.action}</p>
          <p className="text-xs text-navy-400 mt-0.5">{row.adminName}</p>
        </div>
      ),
    },
    {
      header: 'Module',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${MODULE_BADGE[row.module] || 'badge badge-neutral'}`}>
          {row.module}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`badge ${row.status === 'Success' ? 'badge-success' : 'badge-danger'}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'IP Address',
      render: (row) => <span className="text-sm text-navy-500 font-mono">{row.ipAddress || '—'}</span>,
    },
    {
      header: 'Time',
      render: (row) => <span className="text-sm text-navy-500">{formatDateTime(row.createdAt)}</span>,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openDetail(row);
          }}
          className="btn-sm"
        >
          View Details
        </button>
      ),
    },
  ];

  const renderJsonDiff = (oldVal, newVal) => {
    if (!oldVal && !newVal) return <p className="text-sm text-navy-400 italic">No data changes recorded.</p>;

    const allKeys = new Set([...Object.keys(oldVal || {}), ...Object.keys(newVal || {})]);
    const changes = [];

    allKeys.forEach((key) => {
      const old = oldVal?.[key];
      const now = newVal?.[key];
      if (JSON.stringify(old) !== JSON.stringify(now)) {
        changes.push({ key, old, new: now });
      }
    });

    if (changes.length === 0) {
      return <p className="text-sm text-navy-400 italic">No data changes detected.</p>;
    }

    return (
      <div className="space-y-3">
        {changes.map(({ key, old: o, new: n }) => (
          <div key={key} className="bg-navy-50 rounded-lg border border-navy-100 overflow-hidden">
            <div className="bg-navy-100 px-3 py-1.5">
              <p className="text-[10px] font-bold text-navy-600 uppercase tracking-wider">{key}</p>
            </div>
            <div className="grid grid-cols-2 divide-x divide-navy-100">
              <div className="px-3 py-2">
                <p className="text-[10px] font-semibold text-danger-500 uppercase tracking-wider mb-1">Before</p>
                <p className="text-sm text-danger-700 font-mono break-all leading-relaxed">{o !== undefined ? JSON.stringify(o) : '—'}</p>
              </div>
              <div className="px-3 py-2">
                <p className="text-[10px] font-semibold text-success-600 uppercase tracking-wider mb-1">After</p>
                <p className="text-sm text-success-700 font-mono break-all leading-relaxed">{n !== undefined ? JSON.stringify(n) : '—'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const hasActiveFilters = filters.startDate || filters.endDate || filters.action || filters.module || filters.status || filters.search;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Audit Log"
        subtitle="Track all administrative actions across the system"
        action="Export CSV"
        onAction={() => setShowExportConfirm(true)}
      />

      <div className="card p-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-navy-500 mb-1.5 block">Search</label>
            <SearchBox value={filters.search} onSearch={handleSearch} placeholder="Search admin, action, remarks..." />
          </div>
          <FilterDropdown
            label="Module"
            options={MODULE_OPTIONS}
            value={filters.module}
            onChange={(v) => handleFilterChange('module', v)}
          />
          <FilterDropdown
            label="Status"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(v) => handleFilterChange('status', v)}
          />
          <FilterDropdown
            label="Action"
            options={ACTION_OPTIONS}
            value={filters.action}
            onChange={(v) => handleFilterChange('action', v)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <div>
            <label className="text-xs font-medium text-navy-500 mb-1.5 block">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy-500 mb-1.5 block">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input-field"
            />
          </div>
          {hasActiveFilters && (
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ search: '', action: '', module: '', status: '', startDate: '', endDate: '', page: 1 })}
                className="btn-ghost btn-sm text-navy-500"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <PageLoader text="Loading audit logs..." />
      ) : (
        <>
          <div className="text-sm text-navy-500">
            <span className="font-semibold text-navy-700">{pagination.total}</span> log{pagination.total !== 1 ? 's' : ''} found
          </div>
          <div className="card shadow-card overflow-hidden">
            <AdminTable
              columns={columns}
              data={logs}
              onRowClick={openDetail}
              emptyMessage="No audit logs found."
            />
          </div>
          <div className="mt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          </div>
        </>
      )}

      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedLog(null); }}
        title="Audit Log Detail"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-navy-100">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-navy-900">{selectedLog.action}</h3>
                <p className="text-sm text-navy-500">{selectedLog.adminName} &middot; {formatDateTime(selectedLog.createdAt)}</p>
              </div>
              <span className={`badge ${selectedLog.status === 'Success' ? 'badge-success' : 'badge-danger'} ml-auto`}>
                {selectedLog.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Admin</p>
                <p className="text-sm font-semibold text-navy-800">{selectedLog.adminName}</p>
                <p className="text-xs text-navy-500">{selectedLog.adminId?.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Module</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${MODULE_BADGE[selectedLog.module] || 'badge badge-neutral'}`}>
                  {selectedLog.module}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">IP Address</p>
                <p className="text-sm font-mono text-navy-800">{selectedLog.ipAddress || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Timestamp</p>
                <p className="text-sm text-navy-800">{formatDateTime(selectedLog.createdAt)}</p>
              </div>
              {selectedLog.affectedRecordId && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Affected Record</p>
                  <p className="text-sm font-mono text-navy-700 bg-navy-50 inline-block px-2 py-0.5 rounded">{selectedLog.affectedRecordModel}: {selectedLog.affectedRecordId}</p>
                </div>
              )}
            </div>

            {selectedLog.remarks && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-primary-700 uppercase tracking-wider mb-1">Remarks</p>
                <p className="text-sm text-primary-800 leading-relaxed">{selectedLog.remarks}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-3">Data Changes</p>
              {renderJsonDiff(selectedLog.oldValue, selectedLog.newValue)}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={showExportConfirm}
        onClose={() => setShowExportConfirm(false)}
        onConfirm={() => { setShowExportConfirm(false); handleExport(); }}
        title="Export Audit Log"
        message={`Export ${pagination.total} audit log${pagination.total !== 1 ? 's' : ''} as a CSV file?`}
        confirmText="Export CSV"
      />
    </div>
  );
};

export default ManageAuditLog;
