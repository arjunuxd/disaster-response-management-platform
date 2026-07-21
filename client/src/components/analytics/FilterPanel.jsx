import { useState, useEffect, useMemo } from 'react';
import disasterTypeService from '../../services/disasterTypeService';
import { SEVERITY_LEVELS, REPORT_STATUSES, STATE_DISTRICTS } from '../../utils/constants';

const ALL_STATES = Object.keys(STATE_DISTRICTS);

const FilterPanel = ({ filters, onChange, onReset }) => {
  const [disasterTypes, setDisasterTypes] = useState([]);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const res = await disasterTypeService.getDisasterTypes();
        setDisasterTypes(res.data.data.map((t) => ({ value: t._id, label: t.name })));
      } catch { /* silent */ }
    };
    loadTypes();
  }, []);

  const handleChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    if (key === 'state') {
      updated.district = '';
    }
    onChange(updated);
  };

  const availableDistricts = useMemo(() => {
    if (!filters.state) return [];
    return STATE_DISTRICTS[filters.state] || [];
  }, [filters.state]);

  const hasActiveFilters = filters.startDate || filters.endDate || filters.state || filters.district ||
    filters.reportType || filters.severity || filters.status;

  const activeCount = [filters.startDate, filters.endDate, filters.state, filters.district,
    filters.reportType, filters.severity, filters.status].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary-100 text-primary-700 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Primary row: always visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
          <select
            value={filters.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          >
            <option value="">All States</option>
            {ALL_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">District</label>
          <select
            value={filters.district || ''}
            onChange={(e) => handleChange('district', e.target.value)}
            disabled={!filters.state}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">{filters.state ? 'All Districts' : 'Select state first'}</option>
            {availableDistricts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Report Type</label>
          <select
            value={filters.reportType || ''}
            onChange={(e) => handleChange('reportType', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          >
            <option value="">All Types</option>
            {disasterTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Severity</label>
          <select
            value={filters.severity || ''}
            onChange={(e) => handleChange('severity', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          >
            <option value="">All Severities</option>
            {SEVERITY_LEVELS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          >
            <option value="">All Statuses</option>
            {REPORT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date range row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
