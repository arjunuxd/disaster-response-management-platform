import { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Pie, Bar, Doughnut } from 'react-chartjs-2';
import analyticsService from '../../services/analyticsService';
import { PageLoader } from '../../components/ui/Loader';
import StatsCard from '../../components/admin/StatsCard';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { formatDateTime } from '../../utils';
import { ChartCard, FilterPanel, SummaryTable, ExportButton } from '../../components/analytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const defaultFilters = {
  startDate: '',
  endDate: '',
  state: '',
  district: '',
  reportType: '',
  severity: '',
  status: '',
};

const COLORS = {
  blue: '#2563eb',
  amber: '#d97706',
  green: '#16a34a',
  red: '#dc2626',
  purple: '#9333ea',
  pink: '#db2777',
  indigo: '#4f46e5',
  teal: '#0d9488',
  orange: '#ea580c',
  gray: '#6b7280',
  ocean: '#0369a1',
};

const EmptyChart = () => (
  <div className="flex items-center justify-center h-64 text-sm text-navy-400">
    <div className="text-center">
      <svg className="w-10 h-10 text-navy-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p>No data available for the selected filters</p>
    </div>
  </div>
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [fetchError, setFetchError] = useState(null);

  const [overview, setOverview] = useState(null);
  const [reportsByMonth, setReportsByMonth] = useState([]);
  const [reportsByDistrict, setReportsByDistrict] = useState([]);
  const [reportsByType, setReportsByType] = useState([]);
  const [reportsBySeverity, setReportsBySeverity] = useState([]);
  const [reportsByStatus, setReportsByStatus] = useState([]);
  const [alertsByPriority, setAlertsByPriority] = useState([]);
  const [riskZonesByLevel, setRiskZonesByLevel] = useState([]);
  const [sheltersByStatus, setSheltersByStatus] = useState([]);
  const [recentActivity, setRecentActivity] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchAllData = useCallback(async (f = {}) => {
    const params = {};
    if (f.startDate) params.startDate = f.startDate;
    if (f.endDate) params.endDate = f.endDate;
    if (f.state) params.state = f.state;
    if (f.district) params.district = f.district;
    if (f.reportType) params.reportType = f.reportType;
    if (f.severity) params.severity = f.severity;
    if (f.status) params.status = f.status;

    try {
      const [
        overviewRes,
        monthRes,
        districtRes,
        typeRes,
        severityRes,
        statusRes,
        alertRes,
        zoneRes,
        shelterRes,
        activityRes,
      ] = await Promise.allSettled([
        analyticsService.getOverview(params),
        analyticsService.getReportsByMonth(params),
        analyticsService.getReportsByDistrict(params),
        analyticsService.getReportsByType(params),
        analyticsService.getReportsBySeverity(params),
        analyticsService.getReportsByStatus(params),
        analyticsService.getAlertsByPriority(params),
        analyticsService.getRiskZonesByLevel(params),
        analyticsService.getSheltersByStatus(params),
        analyticsService.getRecentActivity(),
      ]);

      const failures = [overviewRes, monthRes, districtRes, typeRes, severityRes, statusRes, alertRes, zoneRes, shelterRes, activityRes]
        .filter((r) => r.status === 'rejected');
      if (failures.length > 0) {
        console.error('Analytics API failures:', failures.map((f) => f.reason?.message || f.reason));
      }
      if (failures.length === 10) {
        setFetchError('Failed to load analytics data. Please check your connection and try again.');
      } else {
        setFetchError(null);
      }

      if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data.data);
      if (monthRes.status === 'fulfilled') setReportsByMonth(monthRes.value.data.data);
      if (districtRes.status === 'fulfilled') setReportsByDistrict(districtRes.value.data.data);
      if (typeRes.status === 'fulfilled') setReportsByType(typeRes.value.data.data);
      if (severityRes.status === 'fulfilled') setReportsBySeverity(severityRes.value.data.data);
      if (statusRes.status === 'fulfilled') setReportsByStatus(statusRes.value.data.data);
      if (alertRes.status === 'fulfilled') setAlertsByPriority(alertRes.value.data.data);
      if (zoneRes.status === 'fulfilled') setRiskZonesByLevel(zoneRes.value.data.data);
      if (shelterRes.status === 'fulfilled') setSheltersByStatus(shelterRes.value.data.data);
      if (activityRes.status === 'fulfilled') setRecentActivity(activityRes.value.data.data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setFetchError('An unexpected error occurred while loading analytics.');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchAllData();
      setLoading(false);
    };
    init();
  }, [fetchAllData]);

  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);
    setChartLoading(true);
    await fetchAllData(newFilters);
    setChartLoading(false);
  };

  const handleFilterReset = async () => {
    setFilters(defaultFilters);
    setFetchError(null);
    setChartLoading(true);
    await fetchAllData();
    setChartLoading(false);
  };

  if (loading) return <PageLoader text="Loading analytics..." />;

  // Chart: Reports by Month (Line)
  const monthChartData = reportsByMonth.length > 0 ? (() => {
    const allTypes = new Set();
    reportsByMonth.forEach((d) => {
      if (d.byType) Object.keys(d.byType).forEach((t) => allTypes.add(t));
    });
    const typeList = Array.from(allTypes);
    const typeColors = ['#2563eb','#d97706','#7c3aed','#dc2626','#16a34a','#0891b2','#e11d48','#ea580c','#6366f1','#92400e'];
    return {
      labels: reportsByMonth.map((d) => d.label),
      datasets: [
        {
          label: 'Total Reports',
          data: reportsByMonth.map((d) => d.total),
          borderColor: COLORS.blue,
          backgroundColor: COLORS.blue + '20',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        ...typeList.slice(0, 5).map((type, i) => ({
          label: type,
          data: reportsByMonth.map((d) => d.byType?.[type] || 0),
          borderColor: typeColors[i % typeColors.length],
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 2,
        })),
      ],
    };
  })() : null;

  const monthChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16, color: '#334155', font: { size: 11 } } } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, color: '#94a3b8' }, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
    },
  };

  // Chart: Reports by Type (Pie)
  const typeChartData = reportsByType.length > 0 ? {
    labels: reportsByType.map((d) => d.label),
    datasets: [{
      data: reportsByType.map((d) => d.count),
      backgroundColor: reportsByType.map((_, i) => {
        const palette = [COLORS.blue, COLORS.amber, COLORS.purple, COLORS.red, COLORS.green, COLORS.teal, COLORS.pink, COLORS.indigo, COLORS.orange, COLORS.gray];
        return palette[i % palette.length];
      }),
      borderWidth: 3,
      borderColor: '#fff',
    }],
  } : null;

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16, color: '#334155', font: { size: 11 } } },
    },
  };

  // Chart: Reports by District (Bar)
  const districtChartData = reportsByDistrict.length > 0 ? {
    labels: reportsByDistrict.map((d) => d.label),
    datasets: [{
      label: 'Reports',
      data: reportsByDistrict.map((d) => d.count),
      backgroundColor: COLORS.ocean + 'CC',
      borderRadius: 6,
    }],
  } : null;

  const districtChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, ticks: { stepSize: 1, color: '#94a3b8' }, grid: { color: '#f1f5f9' } },
      y: { grid: { display: false }, ticks: { color: '#475569', font: { size: 11 } } },
    },
  };

  // Chart: Severity Distribution (Doughnut)
  const severityChartData = reportsBySeverity.length > 0 ? {
    labels: reportsBySeverity.map((d) => d.label),
    datasets: [{
      data: reportsBySeverity.map((d) => d.count),
      backgroundColor: [COLORS.green, COLORS.amber, COLORS.orange, COLORS.red],
      borderWidth: 3,
      borderColor: '#fff',
    }],
  } : null;

  // Chart: Status Distribution (Doughnut)
  const statusChartData = reportsByStatus.length > 0 ? {
    labels: reportsByStatus.map((d) => d.label),
    datasets: [{
      data: reportsByStatus.map((d) => d.count),
      backgroundColor: [COLORS.amber, COLORS.blue, COLORS.red, COLORS.green],
      borderWidth: 3,
      borderColor: '#fff',
    }],
  } : null;

  // Chart: Alerts by Priority (Bar)
  const alertChartData = alertsByPriority.length > 0 ? {
    labels: alertsByPriority.map((d) => d.label),
    datasets: [{
      label: 'Alerts',
      data: alertsByPriority.map((d) => d.count),
      backgroundColor: [COLORS.green, COLORS.amber, COLORS.orange, COLORS.red],
      borderRadius: 6,
    }],
  } : null;

  const alertChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, color: '#94a3b8' }, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
    },
  };

  // Chart: Risk Zones by Level (Pie)
  const zoneChartData = riskZonesByLevel.length > 0 ? {
    labels: riskZonesByLevel.map((d) => d.label),
    datasets: [{
      data: riskZonesByLevel.map((d) => d.count),
      backgroundColor: [COLORS.green, COLORS.amber, COLORS.orange, COLORS.red],
      borderWidth: 3,
      borderColor: '#fff',
    }],
  } : null;

  // Chart: Shelters by Status (Bar)
  const shelterChartData = sheltersByStatus.length > 0 ? {
    labels: sheltersByStatus.map((d) => d.label),
    datasets: [{
      label: 'Shelters',
      data: sheltersByStatus.map((d) => d.count),
      backgroundColor: [COLORS.green, COLORS.red],
      borderRadius: 6,
    }],
  } : null;

  const shelterChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, color: '#94a3b8' }, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
    },
  };

  // Table columns
  const reportColumns = [
    { key: 'title', label: 'Title' },
    { key: 'reportType', label: 'Type', render: (v) => (
      <span className="badge badge-neutral">{v?.name || v}</span>
    )},
    { key: 'severity', label: 'Severity', render: (v) => <StatusBadge status={v} /> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'district', label: 'District' },
    { key: 'createdAt', label: 'Date', render: (v) => formatDateTime(v) },
  ];

  const alertColumns = [
    { key: 'title', label: 'Title' },
    { key: 'priority', label: 'Priority', render: (v) => <PriorityBadge priority={v} /> },
    { key: 'isActive', label: 'Active', render: (v) => (
      <span className={`w-2 h-2 rounded-full inline-block ${v ? 'bg-success-500' : 'bg-navy-300'}`} />
    )},
    { key: 'affectedDistricts', label: 'Districts', render: (v) => v?.join(', ') || '-' },
    { key: 'createdAt', label: 'Date', render: (v) => formatDateTime(v) },
  ];

  const zoneColumns = [
    { key: 'zoneName', label: 'Zone Name' },
    { key: 'riskLevel', label: 'Risk Level', render: (v) => (
      <span className={`badge ${
        v === 'Critical' ? 'badge-danger' :
        v === 'High' ? 'badge-warning' :
        v === 'Moderate' ? 'badge-info' : 'badge-neutral'
      }`}>{v}</span>
    )},
    { key: 'district', label: 'District' },
    { key: 'createdAt', label: 'Date', render: (v) => formatDateTime(v) },
  ];

  const userColumns = [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (v) => (
      <span className={`badge ${v === 'admin' ? 'badge-danger' : 'badge-neutral'}`}>{v}</span>
    )},
    { key: 'isActive', label: 'Status', render: (v) => (
      <span className={`badge ${v ? 'badge-success' : 'badge-danger'}`}>{v ? 'Active' : 'Inactive'}</span>
    )},
    { key: 'createdAt', label: 'Joined', render: (v) => formatDateTime(v) },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Analytics & Reports</h1>
          <p className="text-navy-500 mt-1">Comprehensive system analytics and data insights</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton type="reports" label="Reports" filters={filters} />
          <ExportButton type="alerts" label="Alerts" filters={filters} />
          <ExportButton type="risk-zones" label="Risk Zones" filters={filters} />
          <ExportButton type="users" label="Users" filters={filters} />
        </div>
      </div>

      {/* Filters */}
      <FilterPanel filters={filters} onChange={handleFilterChange} onReset={handleFilterReset} />

      {/* Error Banner */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-800">{fetchError}</p>
            <button onClick={() => { setFetchError(null); handleFilterReset(); }} className="text-xs text-red-600 hover:text-red-700 mt-1 font-medium">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatsCard
            title="Total Reports"
            value={overview.totalReports}
            color="ocean"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            subtitle={`${overview.reportsByType?.length || 0} types`}
          />
          <StatsCard
            title="Pending"
            value={overview.pendingReports}
            color="yellow"
            subtitle={`${overview.verifiedReports} verified`}
          />
          <StatsCard
            title="Resolved"
            value={overview.resolvedReports}
            color="green"
            subtitle={`${overview.totalReports > 0 ? Math.round((overview.resolvedReports / overview.totalReports) * 100) : 0}% rate`}
          />
          <StatsCard
            title="Active Alerts"
            value={overview.activeAlerts}
            color="red"
            subtitle={`${overview.totalAlerts} total`}
          />
          <StatsCard
            title="Risk Zones"
            value={overview.riskZoneCount}
            color="purple"
            subtitle={`${overview.shelterCount} shelters`}
          />
        </div>
      )}

      {/* Charts Grid - compact 3-col for small charts, 2-col for larger ones */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <ChartCard title="Reports by Month" loading={chartLoading}>
          {monthChartData ? (
            <div style={{ height: '220px' }}>
              <Line data={monthChartData} options={monthChartOptions} />
            </div>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Reports by Type" loading={chartLoading}>
          {typeChartData ? (
            <div style={{ height: '220px' }} className="flex items-center justify-center">
              <div style={{ maxWidth: '220px', width: '100%' }}>
                <Pie data={typeChartData} options={pieOptions} />
              </div>
            </div>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Severity Distribution" loading={chartLoading}>
          {severityChartData ? (
            <div style={{ height: '220px' }} className="flex items-center justify-center">
              <div style={{ maxWidth: '220px', width: '100%' }}>
                <Doughnut data={severityChartData} options={pieOptions} />
              </div>
            </div>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Reports by District" loading={chartLoading}>
          {districtChartData ? (
            <div style={{ height: `${Math.min(260, Math.max(180, reportsByDistrict.length * 28))}px` }}>
              <Bar data={districtChartData} options={districtChartOptions} />
            </div>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Report Status" loading={chartLoading}>
          {statusChartData ? (
            <div style={{ height: '220px' }} className="flex items-center justify-center">
              <div style={{ maxWidth: '220px', width: '100%' }}>
                <Doughnut data={statusChartData} options={pieOptions} />
              </div>
            </div>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Alerts by Priority" loading={chartLoading}>
          {alertChartData ? (
            <div style={{ height: '220px' }}>
              <Bar data={alertChartData} options={alertChartOptions} />
            </div>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Risk Zones" loading={chartLoading}>
          {zoneChartData ? (
            <div style={{ height: '220px' }} className="flex items-center justify-center">
              <div style={{ maxWidth: '220px', width: '100%' }}>
                <Pie data={zoneChartData} options={pieOptions} />
              </div>
            </div>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Shelters" loading={chartLoading}>
          {shelterChartData ? (
            <div style={{ height: '220px' }}>
              <Bar data={shelterChartData} options={shelterChartOptions} />
            </div>
          ) : <EmptyChart />}
        </ChartCard>
      </div>

      {/* Recent Activity */}
      {recentActivity && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="section-title text-base">Recent Activity</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {/* Latest Reports */}
            <div className="card shadow-card p-3 hover:shadow-card-hover transition-shadow">
              <h3 className="text-xs font-semibold text-navy-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                Latest Reports
              </h3>
              <div className="space-y-1.5">
                {recentActivity.recentReports?.length === 0 ? (
                  <p className="text-xs text-navy-400 text-center py-3">No reports</p>
                ) : (
                  recentActivity.recentReports?.map((r) => (
                    <div key={r._id} className="flex items-center gap-2 py-1 border-b border-navy-50 last:border-0">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-navy-300" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-navy-900 truncate">{r.title}</p>
                        <p className="text-[10px] text-navy-400">{r.district} &middot; {formatDateTime(r.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Latest Alerts */}
            <div className="card shadow-card p-3 hover:shadow-card-hover transition-shadow">
              <h3 className="text-xs font-semibold text-navy-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-danger-500" />
                Latest Alerts
              </h3>
              <div className="space-y-1.5">
                {recentActivity.recentAlerts?.length === 0 ? (
                  <p className="text-xs text-navy-400 text-center py-3">No alerts</p>
                ) : (
                  recentActivity.recentAlerts?.map((a) => (
                    <div key={a._id} className="flex items-center gap-2 py-1 border-b border-navy-50 last:border-0">
                      <PriorityBadge priority={a.priority} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-navy-900 truncate">{a.title}</p>
                        <p className="text-[10px] text-navy-400">{formatDateTime(a.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Risk Zones */}
            <div className="card shadow-card p-3 hover:shadow-card-hover transition-shadow">
              <h3 className="text-xs font-semibold text-navy-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning-500" />
                Recent Risk Zones
              </h3>
              <div className="space-y-1.5">
                {recentActivity.recentZones?.length === 0 ? (
                  <p className="text-xs text-navy-400 text-center py-3">No risk zones</p>
                ) : (
                  recentActivity.recentZones?.map((z) => (
                    <div key={z._id} className="flex items-center gap-2 py-1 border-b border-navy-50 last:border-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        z.riskLevel === 'Critical' ? 'bg-danger-500' :
                        z.riskLevel === 'High' ? 'bg-warning-500' :
                        z.riskLevel === 'Moderate' ? 'bg-primary-500' : 'bg-success-500'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-navy-900 truncate">{z.zoneName}</p>
                        <p className="text-[10px] text-navy-400">{z.district} &middot; {formatDateTime(z.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Users */}
            <div className="card shadow-card p-3 hover:shadow-card-hover transition-shadow">
              <h3 className="text-xs font-semibold text-navy-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success-500" />
                New Users
              </h3>
              <div className="space-y-1.5">
                {recentActivity.recentUsers?.length === 0 ? (
                  <p className="text-xs text-navy-400 text-center py-3">No users</p>
                ) : (
                  recentActivity.recentUsers?.map((u) => (
                    <div key={u._id} className="flex items-center gap-2 py-1 border-b border-navy-50 last:border-0">
                      <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-medium text-primary-700">
                          {u.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-navy-900 truncate">{u.fullName}</p>
                        <p className="text-[10px] text-navy-400">{formatDateTime(u.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SummaryTable
          title="Reports Summary"
          columns={reportColumns}
          data={recentActivity?.recentReports || []}
          pageSize={5}
        />

        <SummaryTable
          title="Alerts Summary"
          columns={alertColumns}
          data={recentActivity?.recentAlerts || []}
          pageSize={5}
        />

        <SummaryTable
          title="Risk Zones Summary"
          columns={zoneColumns}
          data={recentActivity?.recentZones || []}
          pageSize={5}
        />

        <SummaryTable
          title="Users Summary"
          columns={userColumns}
          data={recentActivity?.recentUsers || []}
          pageSize={5}
        />
      </div>
    </div>
  );
};

export default Analytics;
