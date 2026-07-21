import { useState, useCallback, useRef } from 'react';
import { useMapContext } from '../../context/map/MapContext';

const MapSearchBar = () => {
  const { searchQuery, setSearchQuery, flyTo } = useMapContext();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const params2 = new URLSearchParams({ q: query, limit: '5', countrycodes: 'in', viewbox: '77.0,5.0,88.0,16.0', bounded: '0' });
      const response = await fetch(`/api/geocode/search?${params2}`);
      const data = await response.json();

      setSuggestions(
        data.map((item) => ({
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type,
        }))
      );
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      setLocalQuery(value);
      setShowSuggestions(true);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    },
    [fetchSuggestions]
  );

  const handleSelectSuggestion = useCallback(
    (suggestion) => {
      setLocalQuery(suggestion.displayName);
      setSearchQuery(suggestion.displayName);
      setShowSuggestions(false);
      setSuggestions([]);
      flyTo(suggestion.lat, suggestion.lng, 14);
    },
    [setSearchQuery, flyTo]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setShowSuggestions(false);
      setSearchQuery(localQuery);

      if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      } else if (localQuery.trim().length >= 2) {
        setIsSearching(true);
        fetchSuggestions(localQuery).then(() => {
          setIsSearching(false);
        });
      }
    },
    [localQuery, suggestions, setSearchQuery, fetchSuggestions, handleSelectSuggestion]
  );

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search district, zone, or address..."
            value={localQuery}
            onChange={handleInputChange}
            onFocus={() => localQuery && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-primary-600 border-t-transparent" />
            </div>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors flex-shrink-0"
        >
          Search
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[1001] max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onMouseDown={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-2">
                <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-xs text-gray-900 truncate">{suggestion.displayName}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {suggestion.lat.toFixed(4)}, {suggestion.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapSearchBar;
