import { useState, useEffect, useRef } from 'react';
import { classNames } from '../../utils';

const SearchBox = ({ value = '', onSearch, placeholder = 'Search...', debounce = 300, className = '' }) => {
  const [query, setQuery] = useState(value);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(val);
    }, debounce);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <div className={classNames('relative', className)}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <svg
          className="w-4 h-4 text-navy-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className={classNames(
          'w-full pl-10 pr-9 py-2.5 rounded-lg text-sm font-normal',
          'bg-white border border-navy-200 text-navy-900 placeholder-navy-300',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400',
          'transition-all duration-150'
        )}
      />
      {query && (
        <button
          onClick={handleClear}
          className={classNames(
            'absolute inset-y-0 right-0 pr-3.5 flex items-center',
            'text-navy-300 hover:text-navy-600 transition-colors duration-150'
          )}
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchBox;
