import { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';

const PublicStats = () => {
  const [overview, setOverview] = useState(null);
  const [byType, setByType] = useState([]);
  const [bySeverity, setBySeverity] = useState([]);
  const [byStatus, setByStatus] = useState([]);
  const [byMonth, setByMonth] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [o, t, s, st, m] = await Promise.allSettled([
          analyticsService.getOverview(),
          analyticsService.getReportsByType(),
          analyticsService.getReportsBySeverity(),
          analyticsService.getReportsByStatus(),
          analyticsService.getReportsByMonth(),
        ]);
        if (o.status === 'fulfilled') setOverview(o.value.data.data);
        if (t.status === 'fulfilled') setByType(t.value.data.data);
        if (s.status === 'fulfilled') setBySeverity(s.value.data.data);
        if (st.status === 'fulfilled') setByStatus(st.value.data.data);
        if (m.status === 'fulfilled') setByMonth(m.value.data.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Disaster Statistics</h1>
        <p className="text-gray-500 mt-1">Overview of disaster incidents reported across the platform</p>
      </div>

      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Reports', value: overview.totalReports, color: 'bg-primary-50 border-primary-200 text-primary-700' },
            { label: 'Pending', value: overview.pendingReports, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
            { label: 'Resolved', value: overview.resolvedReports, color: 'bg-green-50 border-green-200 text-green-700' },
            { label: 'Active Alerts', value: overview.activeAlerts, color: 'bg-red-50 border-red-200 text-red-700' },
          ].map((stat, i) => (
            <div key={i} className={`rounded-lg border p-4 ${stat.color}`}>
              <p className="text-2xl font-bold">{stat.value ?? 0}</p>
              <p className="text-xs font-medium opacity-75 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Reports by Disaster Type</h3>
          {byType.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No data available</p>
          ) : (
            <div className="space-y-2">
              {byType.map((item, i) => {
                const maxCount = Math.max(...byType.map((b) => b.count));
                const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium">{item.label}</span>
                      <span className="text-gray-500">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-primary-500 rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">By Severity</h3>
          {bySeverity.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No data available</p>
          ) : (
            <div className="space-y-3">
              {bySeverity.map((item, i) => {
                const colors = {
                  Low: 'bg-blue-500',
                  Medium: 'bg-yellow-500',
                  High: 'bg-orange-500',
                  Critical: 'bg-red-500',
                };
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[item.label] || 'bg-gray-400'}`} />
                    <span className="text-sm text-gray-700 flex-1">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">By Status</h3>
          {byStatus.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No data available</p>
          ) : (
            <div className="space-y-3">
              {byStatus.map((item, i) => {
                const colors = {
                  Pending: 'bg-yellow-500',
                  Verified: 'bg-blue-500',
                  Resolved: 'bg-green-500',
                  Rejected: 'bg-red-500',
                };
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[item.label] || 'bg-gray-400'}`} />
                    <span className="text-sm text-gray-700 flex-1">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Trend</h3>
          {byMonth.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No data available</p>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {byMonth.map((item, i) => {
                const maxTotal = Math.max(...byMonth.map((m) => m.total));
                const pct = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium text-gray-900">{item.total}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-primary-400 rounded-full h-1.5" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-sm text-gray-500">
          Need more detailed analytics?{' '}
          <a href="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</a>{' '}
          to access the full analytics dashboard.
        </p>
      </div>
    </div>
  );
};

export default PublicStats;
