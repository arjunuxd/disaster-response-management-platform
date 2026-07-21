import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import { PageLoader } from '../../components/ui/Loader';
import StatsCard from '../../components/admin/StatsCard';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { formatDateTime } from '../../utils';
import reportService from '../../services/reportService';
import alertService from '../../services/alertService';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [latestAlerts, setLatestAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, reportsRes, alertsRes] = await Promise.allSettled([
          adminService.getDashboardStats(),
          reportService.getReports({ limit: 5, sort: '-createdAt' }),
          alertService.getAlerts(),
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
        if (reportsRes.status === 'fulfilled') setRecentReports(reportsRes.value.data.data);
        if (alertsRes.status === 'fulfilled') setLatestAlerts(alertsRes.value.data.slice(0, 5));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <PageLoader text="Loading admin dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
          Operations Dashboard
        </h1>
        <p className="text-sm text-navy-400 mt-1">
          Welcome back, {user?.fullName?.split(' ')[0]}. Monitor and respond to disaster incidents.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Pending Reports"
            value={stats.pendingReports}
            color="warning"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            subtitle="Awaiting review"
          />
          <StatsCard
            title="Total Reports"
            value={stats.totalReports}
            color="primary"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            subtitle={`${stats.verifiedReports} verified / ${stats.resolvedReports} resolved`}
          />
          <StatsCard
            title="Active Alerts"
            value={stats.activeAlerts}
            color="danger"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
            subtitle={`${stats.totalAlerts} total issued`}
          />
          <StatsCard
            title="Open Shelters"
            value={stats.openShelters}
            color="success"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            subtitle={`${stats.riskZoneCount} risk zones tracked`}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/80">
              <h2 className="section-title">Recent Reports</h2>
              <Link
                to="/admin/reports"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="p-2">
              {recentReports.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-12">No reports yet.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentReports.map((report) => (
                    <Link
                      key={report._id}
                      to="/admin/reports"
                      className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`shrink-0 w-2 h-2 rounded-full ${
                          report.status === 'Pending' ? 'bg-yellow-400' :
                          report.status === 'Assigned' ? 'bg-blue-400' :
                          report.status === 'Verified' ? 'bg-green-400' :
                          report.status === 'Resolved' ? 'bg-emerald-400' :
                          report.status === 'Closed' ? 'bg-gray-400' :
                          report.status === 'Rejected' ? 'bg-red-400' :
                          'bg-navy-300'
                        }`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-navy-900 truncate">{report.title}</p>
                          <p className="text-xs text-navy-400 mt-0.5">{report.district}, {report.state}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <StatusBadge status={report.status} />
                        <span className="text-xs text-navy-300 hidden sm:block whitespace-nowrap">{formatDateTime(report.createdAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/80">
              <h2 className="section-title">Active Alerts</h2>
              <Link
                to="/admin/alerts"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="p-2">
              {latestAlerts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-12">No alerts.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {latestAlerts.map((alert) => (
                    <Link
                      key={alert._id}
                      to="/admin/alerts"
                      className="block px-4 py-3 rounded-lg hover:bg-gray-50/60 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <PriorityBadge priority={alert.priority} />
                        <span className={`w-2 h-2 rounded-full ${alert.isActive ? 'bg-success-500' : 'bg-gray-300'}`} />
                      </div>
                      <p className="text-sm font-medium text-navy-900">{alert.title}</p>
                      <p className="text-xs text-navy-400 mt-0.5 truncate">{alert.affectedDistricts?.join(', ')}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
