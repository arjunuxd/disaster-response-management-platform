import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import alertService from '../services/alertService';
import { useToast } from '../context/ToastContext';
import { PageLoader } from '../components/ui/Loader';
import { PriorityBadge } from '../components/ui/Badge';
import { formatDateTime } from '../utils';

const AlertDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchAlert = async () => {
      try {
        const res = await alertService.getAlertById(id);
        if (!cancelled) setAlert(res.data.data);
      } catch {
        if (!cancelled) {
          toastRef.current.error('Alert not found');
          navigate('/alerts');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAlert();
    return () => { cancelled = true; };
  }, [id, navigate]);

  if (loading) return <PageLoader text="Loading alert..." />;
  if (!alert) return null;

  const isExpired = new Date(alert.expiresAt) < new Date();

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className={`p-6 border-b border-gray-100 ${
          alert.priority === 'Emergency' ? 'bg-red-50' :
          alert.priority === 'High' ? 'bg-orange-50' : ''
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <PriorityBadge priority={alert.priority} />
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                alert.isActive && !isExpired
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {alert.isActive && !isExpired ? 'Active' : 'Expired'}
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">{alert.title}</h1>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Message</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{alert.message}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Affected Districts</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {alert.affectedDistricts?.map((district) => (
                  <span key={district} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {district}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Expires At</h3>
              <p className="text-gray-900">{formatDateTime(alert.expiresAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created By</h3>
              <p className="text-gray-900">{alert.createdBy?.fullName || 'Unknown'}</p>
              <p className="text-sm text-gray-500">{alert.createdBy?.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created At</h3>
              <p className="text-gray-900">{formatDateTime(alert.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDetails;
