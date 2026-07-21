import { useState, useEffect } from 'react';
import { useMapContext } from '../../context/map/MapContext';
import disasterTypeService from '../../services/disasterTypeService';
import {
  SEVERITY_LEVELS,
  REPORT_STATUSES,
  RISK_LEVELS,
} from '../../utils/constants';

const DISTRICTS = [
  'Chennai',
  'Coimbatore',
  'Cuddalore',
  'Dharmapuri',
  'Dindigul',
  'Erode',
  'Kancheepuram',
  'Kanyakumari',
  'Karur',
  'Krishnagiri',
  'Madurai',
  'Nagapattinam',
  'Namakkal',
  'Nilgiris',
  'Perambalur',
  'Pudukkottai',
  'Ramanathapuram',
  'Salem',
  'Sivaganga',
  'Thanjavur',
  'Theni',
  'Thoothukudi',
  'Tiruchirappalli',
  'Tirunelveli',
  'Tiruvallur',
  'Tiruvannamalai',
  'Tiruvarur',
  'Vellore',
  'Viluppuram',
  'Virudhunagar',
];

const MapFilters = ({ onFilterChange }) => {
  const { filters, updateFilter, resetFilters } = useMapContext();
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
    updateFilter(key, value);
    if (onFilterChange) onFilterChange();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
        <button
          onClick={() => { resetFilters(); if (onFilterChange) onFilterChange(); }}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Report Type</label>
          <select
            value={filters.reportType}
            onChange={(e) => handleChange('reportType', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
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
            value={filters.severity}
            onChange={(e) => handleChange('severity', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
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
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          >
            <option value="">All Statuses</option>
            {REPORT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Risk Level</label>
          <select
            value={filters.riskLevel}
            onChange={(e) => handleChange('riskLevel', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          >
            <option value="">All Levels</option>
            {RISK_LEVELS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">District</label>
        <select
          value={filters.district}
          onChange={(e) => handleChange('district', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
        >
          <option value="">All Districts</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
      </div>
    </div>
  );
};

export default MapFilters;
