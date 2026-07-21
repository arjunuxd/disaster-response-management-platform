import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import alertService from '../services/alertService';
import analyticsService from '../services/analyticsService';
import mapService from '../services/mapService';
import { PriorityBadge } from '../components/ui/Badge';
import { formatDate } from '../utils';

const emergencyNumbers = [
  { name: 'National Emergency', number: '112', desc: 'Police / Fire / Ambulance' },
  { name: 'Disaster Response', number: '108', desc: 'NDRF / State Emergency' },
  { name: 'Ambulance', number: '102', desc: 'Medical Emergency' },
  { name: 'Women Helpline', number: '1091', desc: '24x7 Women in Distress' },
];

const AnimatedCounter = ({ target }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target == null || target === '--') return;
    const num = Number(target);
    if (num === 0) { setCount(0); return; }
    const duration = 1200;
    const steps = 40;
    const increment = num / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count}</>;
};

const Home = () => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [overview, setOverview] = useState(null);
  const [shelters, setShelters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertRes, reportRes, overviewRes, shelterRes] = await Promise.allSettled([
          alertService.getActiveAlerts(),
          mapService.getReports({ limit: 6, sort: '-createdAt' }),
          analyticsService.getPublicOverview(),
          mapService.getShelters(),
        ]);
        if (alertRes.status === 'fulfilled') setActiveAlerts(alertRes.value.data.data.slice(0, 4));
        if (reportRes.status === 'fulfilled') setRecentReports(reportRes.value.data.data.slice(0, 6));
        if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data.data);
        if (shelterRes.status === 'fulfilled') setShelters((shelterRes.value.data.data || []).filter((s) => s.status === 'Open').slice(0, 6));
      } catch { /* silent */ }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Reports Filed', value: overview?.totalReports, color: 'text-primary-600', bg: 'bg-primary-50', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
    { label: 'Active Alerts', value: overview?.activeAlerts, color: 'text-danger-600', bg: 'bg-danger-50', icon: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0' },
    { label: 'Risk Zones', value: overview?.riskZoneCount, color: 'text-warning-600', bg: 'bg-warning-50', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' },
    { label: 'Shelters', value: overview?.shelterCount, color: 'text-success-600', bg: 'bg-success-50', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
  ];

  const steps = [
    { num: '1', title: 'Report', desc: 'Report a disaster incident with location, severity level, and photos through our simple form.', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    { num: '2', title: 'Track', desc: 'Monitor reported incidents in real-time on an interactive map with live status updates.', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
    { num: '3', title: 'Respond', desc: 'Authorities coordinate teams and resources for effective disaster response and mitigation.', icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z' },
  ];

  const resources = [
    { to: '/preparedness', label: 'Preparedness Guides', desc: 'Step-by-step guides for disaster preparedness', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { to: '/safety', label: 'Safety Tips', desc: 'Essential safety measures during disasters', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { to: '/helplines', label: 'Emergency Helplines', desc: 'Important emergency contact numbers', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
    { to: '/faq', label: 'FAQ', desc: 'Frequently asked questions about DRMP', icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z' },
  ];

  const quickLinks = [
    { to: '/preparedness', label: 'Preparedness', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { to: '/safety', label: 'Safety Tips', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { to: '/shelters', label: 'Shelters', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
    { to: '/helplines', label: 'Helplines', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
    { to: '/statistics', label: 'Statistics', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' },
    { to: '/faq', label: 'FAQ', icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-[200px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white rounded-full blur-[160px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 lg:pt-36 lg:pb-28 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-xs font-medium text-white/90">System Active — Monitoring 24/7</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Disaster Response &amp; Management Platform
            </h1>

            <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto leading-relaxed">
              A centralized platform for citizens and authorities to report, track, and manage disaster incidents across India.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/map"
                className="inline-flex items-center gap-2.5 bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-xl text-sm hover:bg-gray-50 transition-all duration-200 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                View Disaster Map
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all duration-200 border border-white/25"
              >
                Report an Incident
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 -mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-elevated border border-gray-200/80 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <svg className={`w-5 h-5 ${s.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 leading-none mb-0.5">
                    {s.value != null ? <AnimatedCounter target={s.value} /> : '--'}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Numbers */}
      <section className="bg-white border-b border-gray-100 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-danger-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-danger-600 uppercase tracking-widest shrink-0">Emergency</span>
            </div>
            <div className="h-4 w-px bg-gray-200 shrink-0" />
            <div className="flex items-center gap-6">
              {emergencyNumbers.map((en, i) => (
                <span key={i} className="text-sm text-gray-500 whitespace-nowrap">
                  <span className="font-semibold text-gray-800">{en.name}</span>{' '}
                  <a href={`tel:${en.number}`} className="text-danger-500 font-bold hover:text-danger-600 transition-colors">{en.number}</a>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-danger-500" />
                  </span>
                  <span className="text-[11px] font-bold text-danger-500 uppercase tracking-widest">Live</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Active Alerts</h2>
                <p className="text-sm text-gray-500 mt-1">Current disaster warnings and advisories</p>
              </div>
              <Link to="/alerts" className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 transition-colors">
                View All
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeAlerts.map((alert) => (
                <Link
                  key={alert._id}
                  to={`/alerts/${alert._id}`}
                  className="group block bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-card-hover transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <PriorityBadge priority={alert.priority} />
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors mb-1.5 line-clamp-2">{alert.title}</p>
                  <p className="text-xs text-gray-400">{alert.affectedDistricts?.join(', ')}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold text-primary-600 uppercase tracking-widest block mb-3">How It Works</span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-3">
              Three Steps to Safer Communities
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
              Connecting citizens with disaster management authorities for faster, more effective response.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div key={step.num} className="relative">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 h-full hover:shadow-card-hover transition-all duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Step {step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 w-6 items-center justify-center -translate-y-1/2 z-10">
                    <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Incidents + Sidebar */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[11px] font-bold text-primary-600 uppercase tracking-widest block mb-2">Latest</span>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Recent Incidents</h2>
                </div>
                <Link to="/map" className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 transition-colors">
                  View on Map
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                {recentReports.length === 0 ? (
                  <div className="py-16 text-center">
                    <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <p className="text-sm text-gray-400">No recent incidents reported.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {recentReports.map((report) => (
                      <div key={report._id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/80 transition-colors">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{report.reportType?.name || report.reportType}</span>
                            <span className={`badge-severity-${report.severity?.toLowerCase()}`}>{report.severity}</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 truncate">{report.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{report.district}, {report.state}</p>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0 hidden sm:block">{formatDate(report.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                <h3 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-widest">Emergency Contacts</h3>
                <div className="space-y-2">
                  {emergencyNumbers.map((en, i) => (
                    <a
                      key={i}
                      href={`tel:${en.number}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200 hover:border-danger-200 hover:bg-danger-50/30 transition-all duration-200 group"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{en.name}</p>
                        <p className="text-[11px] text-gray-400">{en.desc}</p>
                      </div>
                      <span className="text-lg font-bold text-danger-500 group-hover:text-danger-600 transition-colors">{en.number}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                <h3 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-widest">Quick Links</h3>
                <div className="grid grid-cols-2 gap-2">
                  {quickLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center gap-2 bg-white rounded-xl p-3 border border-gray-200 hover:border-primary-200 hover:bg-primary-50/50 transition-all duration-200 group"
                    >
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                      <span className="text-xs font-medium text-gray-600 group-hover:text-primary-700">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Shelters */}
      {shelters.length > 0 && (
        <section className="bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[11px] font-bold text-success-600 uppercase tracking-widest block mb-2">Available Now</span>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Open Shelters</h2>
                <p className="text-sm text-gray-500 mt-1">Safe locations available during emergencies</p>
              </div>
              <Link to="/shelters" className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 transition-colors">
                View All
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shelters.map((shelter) => (
                <Link
                  key={shelter._id}
                  to="/shelters"
                  className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-success-300 hover:shadow-card-hover transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-success-50 rounded-xl flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-success-700 transition-colors">{shelter.shelterName}</p>
                        <p className="text-xs text-gray-400">{shelter.district}{shelter.state ? `, ${shelter.state}` : ''}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-50 text-success-700 shrink-0">Open</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100 mt-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                      Capacity: {shelter.capacity?.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      {shelter.contactNumber}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Resources */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold text-primary-600 uppercase tracking-widest block mb-3">Resources</span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-3">Be Prepared</h2>
            <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
              Access resources to help you and your family prepare for disasters.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {resources.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group bg-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-card-hover hover:border-gray-300 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors">{item.label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Be Prepared. Stay Informed. Act Fast.
            </h2>
            <p className="text-white/60 mb-8 text-lg leading-relaxed max-w-lg mx-auto">
              Create an account to report incidents, receive real-time alerts, and help your community respond to disasters effectively.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-xl text-sm hover:bg-gray-50 transition-all duration-200 shadow-lg"
              >
                Create Free Account
              </Link>
              <Link
                to="/preparedness"
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all duration-200 border border-white/25"
              >
                Preparedness Guides
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
              {['Report Incidents', 'Real-time Alerts', 'Live Tracking', 'Safe Shelters'].map((label) => (
                <div key={label} className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2">
                  <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs font-medium text-white/70">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
