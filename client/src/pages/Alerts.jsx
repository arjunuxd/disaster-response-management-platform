import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import alertService from '../services/alertService';
import { PageLoader } from '../components/ui/Loader';
import { PriorityBadge } from '../components/ui/Badge';
import { formatDate } from '../utils';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const res = filter === 'active'
          ? await alertService.getActiveAlerts()
          : await alertService.getAlerts();
        setAlerts(res.data.data);
        setError(null);
      } catch (err) {
        setError('Failed to load alerts. Please try again.');
        console.error('Alerts fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [filter]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-500 mt-1">View emergency alerts and notifications</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === 'active' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === 'all' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {loading ? (
        <PageLoader text="Loading alerts..." />
      ) : error ? (
        <div className="bg-red-50 rounded-xl border border-red-200 p-6 text-center">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button
            onClick={() => setFilter((prev) => prev)}
            className="text-sm font-medium text-red-700 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No alerts</h3>
          <p className="text-gray-500 text-sm">No {filter === 'active' ? 'active ' : ''}alerts at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Link
              key={alert._id}
              to={`/alerts/${alert._id}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <PriorityBadge priority={alert.priority} />
                  <span className={`w-2 h-2 rounded-full ${alert.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                </div>
                <span className="text-xs text-gray-400">{formatDate(alert.createdAt)}</span>
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">{alert.title}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{alert.message}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs text-gray-500">{alert.affectedDistricts?.join(', ')}</span>
                {alert.expiresAt && (
                  <span className="text-xs text-gray-400 ml-auto">
                    Expires: {formatDate(alert.expiresAt)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
