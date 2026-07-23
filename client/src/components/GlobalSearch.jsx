import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import searchService from '../services/searchService';
import { useDebounce } from '../hooks';
import { classNames } from '../utils';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setResults(null);
      return;
    }

    const controller = new AbortController();

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await searchService.globalSearch(debouncedQuery, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setResults(res.data.data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setResults(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchResults();
    return () => controller.abort();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = useCallback((path) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  }, [navigate]);

  const totalResults = results
    ? (results.reports?.length || 0) + (results.alerts?.length || 0) + (results.riskZones?.length || 0)
    : 0;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        aria-label="Search"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden lg:block">Search...</span>
        <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 rounded">
          Ctrl+K
        </kbd>
      </button>

      {isOpen && createPortal(
        <>
          <div className="fixed inset-0 z-[2100] bg-black/20" onClick={() => setIsOpen(false)} />
          <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white rounded-xl shadow-2xl border border-gray-200 z-[2101] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reports, alerts, risk zones..."
                className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none"
                autoFocus
              />
              {loading && (
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-400 hover:text-gray-600 shrink-0"
              >
                Esc
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {!query || query.length < 2 ? (
                <div className="p-6 text-center text-sm text-gray-400">
                  Type at least 2 characters to search
                </div>
              ) : results && totalResults === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">
                  No results found for &ldquo;{query}&rdquo;
                </div>
              ) : results ? (
                <div className="py-2">
                  {results.reports?.length > 0 && (
                    <div>
                      <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Reports</p>
                      {results.reports.map((report) => (
                        <button
                          key={report._id}
                          onClick={() => handleNavigate(`/reports/${report._id}`)}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-start gap-3"
                        >
                          <span className="shrink-0 w-2 h-2 rounded-full mt-1.5 bg-gray-400" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{report.title}</p>
                            <p className="text-xs text-gray-500">{report.district}{report.address ? ` - ${report.address}` : ''}</p>
                          </div>
                          <span className={classNames('shrink-0 text-xs px-2 py-0.5 rounded-full font-medium',
                            report.status === 'Pending' && 'bg-yellow-100 text-yellow-700',
                            report.status === 'Verified' && 'bg-blue-100 text-blue-700',
                            report.status === 'Rejected' && 'bg-red-100 text-red-700',
                            report.status === 'Resolved' && 'bg-green-100 text-green-700'
                          )}>{report.status}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.alerts?.length > 0 && (
                    <div>
                      <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Alerts</p>
                      {results.alerts.map((alert) => (
                        <button
                          key={alert._id}
                          onClick={() => handleNavigate(`/dashboard/alerts/${alert._id}`)}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-start gap-3"
                        >
                          <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{alert.title}</p>
                            <p className="text-xs text-gray-500">{alert.affectedDistricts?.join(', ')}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.riskZones?.length > 0 && (
                    <div>
                      <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Risk Zones</p>
                      {results.riskZones.map((zone) => (
                        <button
                          key={zone._id}
                          onClick={() => handleNavigate('/dashboard/map')}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-start gap-3"
                        >
                          <svg className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{zone.name}</p>
                            <p className="text-xs text-gray-500">{zone.district}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default GlobalSearch;
