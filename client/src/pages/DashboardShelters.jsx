import { useState, useEffect } from 'react';
import mapService from '../services/mapService';

const DashboardShelters = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Open');

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const res = await mapService.getShelters();
        setShelters(res.data.data || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchShelters();
  }, []);

  const filtered = filter === 'All' ? shelters : shelters.filter((s) => s.status === filter);
  const openCount = shelters.filter((s) => s.status === 'Open').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shelters</h1>
        <p className="text-gray-500 mt-1">Find safe shelter locations near you during emergencies</p>
        {!loading && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-3 inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            {openCount} shelter{openCount !== 1 ? 's' : ''} currently open
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['Open', 'Closed', 'All'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Shelter Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No {filter.toLowerCase()} shelters found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((shelter) => (
            <div key={shelter._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-card-hover transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{shelter.shelterName}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{shelter.address}</p>
                  <p className="text-sm text-gray-500">{shelter.district}{shelter.state ? `, ${shelter.state}` : ''}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  shelter.status === 'Open'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {shelter.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                {shelter.capacity && <span>Capacity: {shelter.capacity.toLocaleString()}</span>}
                {shelter.contactNumber && <span>Ph: {shelter.contactNumber}</span>}
              </div>
              {shelter.latitude && shelter.longitude && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${shelter.latitude}&mlon=${shelter.longitude}#map=16/${shelter.latitude}/${shelter.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  View on Map
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardShelters;
