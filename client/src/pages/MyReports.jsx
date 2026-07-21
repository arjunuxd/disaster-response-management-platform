import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import reportService from '../services/reportService';
import disasterTypeService from '../services/disasterTypeService';
import { PageLoader } from '../components/ui/Loader';
import Pagination from '../components/ui/Pagination';
import SearchBox from '../components/ui/SearchBox';
import FilterDropdown from '../components/ui/FilterDropdown';
import ReportCard from '../components/ReportCard';
import { SEVERITY_LEVELS, REPORT_STATUSES } from '../utils/constants';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [disasterTypes, setDisasterTypes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    reportType: '',
    severity: '',
    status: '',
    page: 1,
  });

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
    const fetchReports = async () => {
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
        setError(null);
      } catch (err) {
        setError('Failed to load reports. Please try again.');
        console.error('Reports fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [filters]);

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Browse and manage all incident reports</p>
        </div>
        <Link
          to="/reports/new"
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          New Report
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
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
      ) : error ? (
        <div className="bg-red-50 rounded-xl border border-red-200 p-6 text-center">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page }))}
            className="text-sm font-medium text-red-700 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No reports found</h3>
          <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or create a new report.</p>
          <Link to="/reports/new" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            Create a report &rarr;
          </Link>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-500 mb-4">{pagination.total} report(s) found</div>
          <div className="space-y-4">
            {reports.map((report) => (
              <ReportCard key={report._id} report={report} />
            ))}
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
    </div>
  );
};

export default MyReports;
