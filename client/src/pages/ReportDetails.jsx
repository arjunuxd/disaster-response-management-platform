import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import reportService from '../services/reportService';
import { PageLoader } from '../components/ui/Loader';
import { SeverityBadge, StatusBadge } from '../components/ui/Badge';
import { formatDateTime } from '../utils';
import Modal from '../components/ui/Modal';
import { SEVERITY_LEVELS } from '../utils/constants';

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editData, setEditData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const fetchReport = async () => {
      try {
        const res = await reportService.getReportById(id);
        if (!cancelled) setReport(res.data.data);
      } catch {
        if (!cancelled) {
          toastRef.current.error('Report not found');
          navigate('/reports');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchReport();
    return () => { cancelled = true; };
  }, [id, navigate]);

  const isOwner = user && report?.reportedBy?._id === user.id;

  const openEditModal = () => {
    setEditData({
      title: report.title,
      description: report.description,
      severity: report.severity,
      address: report.address || '',
    });
    setNewImages([]);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', editData.title);
      fd.append('description', editData.description);
      fd.append('severity', editData.severity);
      fd.append('address', editData.address);
      newImages.forEach((file) => fd.append('images', file));

      const res = await reportService.updateReport(id, fd);
      setReport(res.data.data);
      setShowEditModal(false);
      toast.success('Report updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update report.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await reportService.deleteReport(id);
      toast.success('Report deleted successfully!');
      navigate('/reports');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete report.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return <PageLoader text="Loading report..." />;
  if (!report) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                {report.reportType?.name || report.reportType}
              </span>
              <SeverityBadge severity={report.severity} />
              <StatusBadge status={report.status} />
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={openEditModal}
                  className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-sm px-3 py-1.5 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">{report.title}</h1>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
              <p className="text-gray-900">{report.district}, {report.state}</p>
              {report.address && <p className="text-sm text-gray-500 mt-1">{report.address}</p>}
              <p className="text-xs text-gray-400 mt-1">
                Lat: {report.latitude}, Lng: {report.longitude}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Reported By</h3>
              <p className="text-gray-900">{report.reportedBy?.fullName || 'Unknown'}</p>
              <p className="text-sm text-gray-500">{report.reportedBy?.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
              <p className="text-gray-900">{formatDateTime(report.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
              <p className="text-gray-900">{formatDateTime(report.updatedAt)}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
          </div>

          {report.images && report.images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {report.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Report image ${idx + 1}`}
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}

          {report.verifiedBy && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-1">Verified By</h3>
              <p className="text-blue-700">{report.verifiedBy.fullName}</p>
              {report.remarks && (
                <p className="text-sm text-blue-600 mt-1">{report.remarks}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Report" size="lg">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={editData.title || ''}
              onChange={(e) => setEditData((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={editData.description || ''}
              onChange={(e) => setEditData((p) => ({ ...p, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={editData.severity || ''}
                onChange={(e) => setEditData((p) => ({ ...p, severity: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {SEVERITY_LEVELS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                value={editData.address || ''}
                onChange={(e) => setEditData((p) => ({ ...p, address: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Add Images</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={(e) => setNewImages(Array.from(e.target.files))}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 file:cursor-pointer"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={editLoading} className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Report" size="sm">
        <p className="text-gray-600 text-sm mb-6">Are you sure you want to delete this report? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleteLoading} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ReportDetails;
