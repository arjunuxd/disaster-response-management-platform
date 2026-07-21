import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import reportService from '../services/reportService';
import alertService from '../services/alertService';
import mapService from '../services/mapService';
import { PageLoader } from '../components/ui/Loader';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { formatDate } from '../utils';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [latestAlerts, setLatestAlerts] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, reportRes, alertRes, shelterRes] = await Promise.allSettled([
          dashboardService.getStats(),
          reportService.getReports({ limit: 5, sort: '-createdAt' }),
          alertService.getActiveAlerts(),
          mapService.getShelters(),
        ]);

        if (dashRes.status === 'fulfilled') setStats(dashRes.value.data.data);
        if (reportRes.status === 'fulfilled') setRecentReports(reportRes.value.data.data);
        if (alertRes.status === 'fulfilled') setLatestAlerts(alertRes.value.data.data.slice(0, 5));
        if (shelterRes.status === 'fulfilled') setShelters((shelterRes.value.data.data || []).filter((s) => s.status === 'Open'));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <PageLoader text="Loading dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.fullName?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Here&apos;s an overview of your activity</p>
        </div>
        <Link to="/reports/new" className="btn-primary hidden sm:inline-flex">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Report
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Reports" value={stats.totalReports} variant="primary" icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          } />
          <StatCard title="Pending" value={stats.pendingReports} variant="warning" icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } />
          <StatCard title="Resolved" value={stats.resolvedReports} variant="success" icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } />
          <StatCard title="Active Alerts" value={stats.activeAlerts} variant="danger" icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          } />
        </div>
      )}

      {/* Reports + Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Recent Reports</h2>
                <p className="text-xs text-gray-500 mt-0.5">Your latest incident reports</p>
              </div>
              <Link to="/reports" className="text-xs text-primary-600 hover:text-primary-700 font-semibold">
                View All
              </Link>
            </div>
            <div className="p-2">
              {recentReports.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No reports yet.</p>
                  <Link to="/reports/new" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
                    Submit your first report
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentReports.map((report) => (
                    <Link
                      key={report._id}
                      to={`/reports/${report._id}`}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`status-dot shrink-0 ${
                          report.status === 'Resolved' ? 'status-dot-active' :
                          report.status === 'Pending' ? 'status-dot-warning' :
                          'status-dot-neutral'
                        }`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{report.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{report.district}, {report.state}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge status={report.status} />
                        <span className="text-xs text-gray-400 hidden sm:block">{formatDate(report.createdAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Active Alerts</h2>
                <p className="text-xs text-gray-500 mt-0.5">Current warnings and advisories</p>
              </div>
              <Link to="/dashboard/alerts" className="text-xs text-primary-600 hover:text-primary-700 font-semibold">
                View All
              </Link>
            </div>
            <div className="p-2">
              {latestAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  <p className="text-gray-500 text-sm">No active alerts.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {latestAlerts.map((alert) => (
                    <Link
                      key={alert._id}
                      to={`/dashboard/alerts/${alert._id}`}
                      className="block p-4 rounded-lg hover:bg-gray-50/80 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <PriorityBadge priority={alert.priority} />
                        <span className="status-dot status-dot-active" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{alert.affectedDistricts?.join(', ')}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/reports/new" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-card-hover transition-all duration-200 group">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center ring-1 ring-primary-500/10 group-hover:bg-primary-100 transition-colors">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors text-sm">Report Incident</p>
              <p className="text-xs text-gray-500 mt-0.5">Submit a new report</p>
            </div>
          </div>
        </Link>

        <Link to="/reports" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-card-hover transition-all duration-200 group">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-warning-50 rounded-xl flex items-center justify-center ring-1 ring-warning-500/10 group-hover:bg-warning-100 transition-colors">
              <svg className="w-5 h-5 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors text-sm">My Reports</p>
              <p className="text-xs text-gray-500 mt-0.5">View all your reports</p>
            </div>
          </div>
        </Link>

        <Link to="/profile" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-card-hover transition-all duration-200 group">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-navy-50 rounded-xl flex items-center justify-center ring-1 ring-navy-500/10 group-hover:bg-navy-100 transition-colors">
              <svg className="w-5 h-5 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors text-sm">Profile</p>
              <p className="text-xs text-gray-500 mt-0.5">Manage your account</p>
            </div>
          </div>
        </Link>

        <Link to="/dashboard/shelters" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-card-hover transition-all duration-200 group">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center ring-1 ring-green-500/10 group-hover:bg-green-100 transition-colors">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors text-sm">Find Shelters</p>
              <p className="text-xs text-gray-500 mt-0.5">Locate safe shelters</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Open Shelters */}
      {shelters.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Open Shelters</h2>
              <p className="text-xs text-gray-500 mt-0.5">Safe locations available near you</p>
            </div>
            <Link to="/dashboard/shelters" className="text-xs text-primary-600 hover:text-primary-700 font-semibold">
              View All
            </Link>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {shelters.slice(0, 6).map((shelter) => (
                <div key={shelter._id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-primary-50 transition-colors">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{shelter.shelterName}</p>
                    <p className="text-xs text-gray-500">{shelter.district}{shelter.state ? `, ${shelter.state}` : ''}</p>
                    <p className="text-[11px] text-gray-400 mt-1">Capacity: {shelter.capacity?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, variant, icon }) => {
  const variants = {
    primary: { bg: 'bg-primary-50', icon: 'text-primary-600', ring: 'ring-primary-500/10' },
    warning: { bg: 'bg-warning-50', icon: 'text-warning-600', ring: 'ring-warning-500/10' },
    success: { bg: 'bg-success-50', icon: 'text-success-600', ring: 'ring-success-500/10' },
    danger: { bg: 'bg-danger-50', icon: 'text-danger-600', ring: 'ring-danger-500/10' },
  };

  const v = variants[variant] || variants.primary;

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${v.bg} ring-1 ${v.ring} ${v.icon}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
    </div>
  );
};

export default Dashboard;
