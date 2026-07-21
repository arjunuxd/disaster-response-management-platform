import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import alertService from '../services/alertService';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { formatDate } from '../utils';

const PublicAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const res = filter === 'active'
          ? await alertService.getActiveAlerts()
          : await alertService.getAlerts();
        setAlerts(res.data.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [filter]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Disaster Alerts</h1>
        <p className="text-gray-500 mt-1">Stay informed about active disaster situations in your area</p>
      </div>

      <div className="flex gap-2 mb-6">
        {['active', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === 'active' ? 'Active Alerts' : 'All Alerts'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No alerts</h3>
          <p className="text-gray-500 text-sm">No {filter === 'active' ? 'active' : ''} alerts at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Link
              key={alert._id}
              to={`/alerts/${alert._id}`}
              className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <PriorityBadge priority={alert.priority} />
                    {alert.isActive && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                    <StatusBadge status={alert.isActive ? 'Active' : 'Inactive'} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{alert.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{alert.affectedDistricts?.join(', ')}</span>
                    {alert.expiresAt && (
                      <span>Expires {formatDate(alert.expiresAt)}</span>
                    )}
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-300 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicAlerts;
