import { useState, useEffect, useCallback, useRef } from 'react';
import adminService from '../../services/adminService';
import reportService from '../../services/reportService';
import disasterTypeService from '../../services/disasterTypeService';
import { PageLoader } from '../../components/ui/Loader';
import Pagination from '../../components/ui/Pagination';
import SearchBox from '../../components/ui/SearchBox';
import FilterDropdown from '../../components/ui/FilterDropdown';
import AdminTable from '../../components/admin/AdminTable';
import PageHeader from '../../components/admin/PageHeader';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import { useToast } from '../../context/ToastContext';
import { SEVERITY_LEVELS, REPORT_STATUSES } from '../../utils/constants';
import { formatDate } from '../../utils';

const ManageReports = () => {
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const [reports, setReports] = useState([]);
  const [disasterTypes, setDisasterTypes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    reportType: '',
    severity: '',
    status: '',
    page: 1,
  });

  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [statusData, setStatusData] = useState({ status: '', remarks: '' });
  const [assignData, setAssignData] = useState({ assignedTo: '', remarks: '' });
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const res = await disasterTypeService.getDisasterTypes();
        setDisasterTypes(res.data.data.map((t) => ({ value: t._id, label: t.name })));
      } catch { /* silent */ }
    };
    loadTypes();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await adminService.getUsers({ limit: 100, role: 'admin' });
        setAssignableUsers(res.data.data || []);
      } catch { /* silent */ }
    };
    loadUsers();
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.reportType) params.reportType = filters.reportType;
      if (filters.severity) params.severity = filters.severity;
      if (filters.status) params.status = filters.status;
      params.page = filters.page;
      params.limit = 10;

      const res = await reportService.getReports(params);
      setReports(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toastRef.current.error('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const openStatusModal = (report) => {
    setSelectedReport(report);
    setStatusData({ status: report.status, remarks: report.remarks || '' });
    setShowStatusModal(true);
  };

  const openAssignModal = (report) => {
    setSelectedReport(report);
    setAssignData({ assignedTo: report.assignedTo?._id || '', remarks: '' });
    setShowAssignModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedReport || !statusData.status) return;
    setActionLoading(true);
    try {
      await adminService.updateReportStatus(selectedReport._id, {
        status: statusData.status,
        remarks: statusData.remarks,
      });
      toast.success('Report status updated successfully.');
      setShowStatusModal(false);
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update report status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      await adminService.deleteReport(selectedReport._id);
      toast.success('Report deleted successfully.');
      setShowDeleteConfirm(false);
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete report.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedReport || !assignData.assignedTo) return;
    setActionLoading(true);
    try {
      await adminService.assignReport(selectedReport._id, {
        assignedTo: assignData.assignedTo,
        remarks: assignData.remarks,
      });
      toast.success('Report assigned successfully.');
      setShowAssignModal(false);
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign report.');
    } finally {
      setActionLoading(false);
    }
  };

  const severityBadge = (severity) => {
    const map = {
      Critical: 'badge-danger',
      High: 'badge-warning',
      Medium: 'badge-info',
      Low: 'badge-neutral',
    };
    return map[severity] || 'badge-neutral';
  };

  const statusBadge = (status) => {
    const map = {
      Pending: 'badge-warning',
      'Under Review': 'badge-info',
      Assigned: 'badge-info',
      Verified: 'badge-info',
      Resolved: 'badge-success',
      Rejected: 'badge-danger',
      Closed: 'badge-neutral',
    };
    return map[status] || 'badge-neutral';
  };

  const columns = [
    {
      header: 'Report',
      render: (row) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-neutral">{row.reportType?.name || row.reportType}</span>
            <span className={severityBadge(row.severity)}>{row.severity}</span>
          </div>
          <p className="font-medium text-navy-900 truncate">{row.title}</p>
          <p className="text-xs text-navy-400 mt-0.5">{row.district}, {row.state}</p>
        </div>
      ),
    },
    {
      header: 'Reported By',
      render: (row) => (
        <span className="text-sm text-navy-500">{row.reportedBy?.fullName || 'Unknown'}</span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={statusBadge(row.status)}>{row.status}</span>
      ),
    },
    {
      header: 'Date',
      render: (row) => <span className="text-sm text-navy-400">{formatDate(row.createdAt)}</span>,
    },
    {
      header: 'Assigned To',
      render: (row) => (
        <span className="text-sm text-navy-500">{row.assignedTo?.fullName || '-'}</span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          {row.status === 'Pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedReport(row);
                setStatusData({ status: 'Under Review', remarks: '' });
                setShowStatusModal(true);
              }}
              className="btn-primary btn-xs"
            >
              Start Review
            </button>
          )}
          {['Pending', 'Under Review'].includes(row.status) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openAssignModal(row);
              }}
              className="btn-primary btn-xs"
            >
              Assign
            </button>
          )}
          {row.status === 'Assigned' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedReport(row);
                setStatusData({ status: 'Resolved', remarks: '' });
                setShowStatusModal(true);
              }}
              className="btn-primary btn-xs"
            >
              Mark Resolved
            </button>
          )}
          {['Verified', 'Resolved'].includes(row.status) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedReport(row);
                setStatusData({ status: 'Closed', remarks: 'Report closed by admin' });
                setShowStatusModal(true);
              }}
              className="btn-secondary btn-xs"
            >
              Close
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openStatusModal(row);
            }}
            className="btn-secondary btn-xs"
          >
            Status
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReport(row);
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
      <PageHeader title="Manage Reports" subtitle="Review and manage all incident reports" />

      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBox value={filters.search} onSearch={handleSearch} placeholder="Search reports..." />
          </div>
          <div className="flex flex-wrap gap-3">
            <FilterDropdown
              options={disasterTypes}
              value={filters.reportType}
              onChange={(v) => handleFilterChange('reportType', v)}
            />
            <FilterDropdown
              options={SEVERITY_LEVELS}
              value={filters.severity}
              onChange={(v) => handleFilterChange('severity', v)}
            />
            <FilterDropdown
              options={REPORT_STATUSES}
              value={filters.status}
              onChange={(v) => handleFilterChange('status', v)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <PageLoader text="Loading reports..." />
      ) : (
        <>
          <p className="text-sm text-navy-400 mb-4">{pagination.total} report(s) found</p>
          <div className="card overflow-hidden">
            <AdminTable
              columns={columns}
              data={reports}
              onRowClick={(row) => {
                setSelectedReport(row);
                setShowDetailModal(true);
              }}
              emptyMessage="No reports found."
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

      <Modal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedReport(null); }} title="Report Details" size="lg">
        {selectedReport && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Title</p>
                <p className="text-sm font-medium text-navy-900">{selectedReport.title}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Type</p>
                <span className="badge-neutral">{selectedReport.reportType?.name || selectedReport.reportType}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Severity</p>
                <span className={severityBadge(selectedReport.severity)}>{selectedReport.severity}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Status</p>
                <span className={statusBadge(selectedReport.status)}>{selectedReport.status}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Location</p>
                <p className="text-sm text-navy-900">{selectedReport.district}, {selectedReport.state}</p>
                {selectedReport.address && <p className="text-xs text-navy-400 mt-0.5">{selectedReport.address}</p>}
              </div>
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Reported By</p>
                <p className="text-sm text-navy-900">{selectedReport.reportedBy?.fullName || 'Unknown'}</p>
                <p className="text-xs text-navy-400 mt-0.5">{selectedReport.reportedBy?.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Assigned To</p>
                <p className="text-sm text-navy-900">{selectedReport.assignedTo?.fullName || 'Not assigned'}</p>
                {selectedReport.assignedAt && <p className="text-xs text-navy-400 mt-0.5">Since {formatDate(selectedReport.assignedAt)}</p>}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-navy-700 whitespace-pre-wrap leading-relaxed">{selectedReport.description}</p>
            </div>
            {selectedReport.remarks && (
              <div className="bg-primary-50 border border-primary-200/60 rounded-lg p-4">
                <p className="text-xs font-semibold text-primary-700 uppercase tracking-wider mb-1">Admin Remarks</p>
                <p className="text-sm text-primary-800">{selectedReport.remarks}</p>
              </div>
            )}
            {selectedReport.images && selectedReport.images.length > 0 && (
              <div>
                <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-2">Images</p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedReport.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Image ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={showStatusModal} onClose={() => { setShowStatusModal(false); setSelectedReport(null); }} title="Update Report Status" size="md">
        <div className="space-y-4">
          <div>
            <label className="input-label">Status</label>
            <select
              value={statusData.status}
              onChange={(e) => setStatusData((p) => ({ ...p, status: e.target.value }))}
              className="input-field"
            >
              {REPORT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Remarks</label>
            <textarea
              value={statusData.remarks}
              onChange={(e) => setStatusData((p) => ({ ...p, remarks: e.target.value }))}
              rows={3}
              placeholder="Add admin remarks..."
              className="input-field resize-y"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setShowStatusModal(false); setSelectedReport(null); }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleStatusUpdate}
              disabled={actionLoading}
              className="btn-primary"
            >
              {actionLoading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAssignModal} onClose={() => { setShowAssignModal(false); setSelectedReport(null); }} title="Assign Report" size="md">
        <div className="space-y-4">
          <div>
            <label className="input-label">Assign To</label>
            <select
              value={assignData.assignedTo}
              onChange={(e) => setAssignData((p) => ({ ...p, assignedTo: e.target.value }))}
              className="input-field"
            >
              <option value="">Select admin user</option>
              {assignableUsers.map((u) => (
                <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Remarks</label>
            <textarea
              value={assignData.remarks}
              onChange={(e) => setAssignData((p) => ({ ...p, remarks: e.target.value }))}
              rows={3}
              placeholder="Add assignment notes..."
              className="input-field resize-y"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setShowAssignModal(false); setSelectedReport(null); }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={actionLoading || !assignData.assignedTo}
              className="btn-primary"
            >
              {actionLoading ? 'Assigning...' : 'Assign Report'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setSelectedReport(null); }}
        onConfirm={handleDeleteReport}
        title="Delete Report"
        message={`Are you sure you want to delete "${selectedReport?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={actionLoading}
        danger
      />
    </div>
  );
};

export default ManageReports;
