import { useState, useRef, useEffect } from 'react';
import { classNames } from '../../utils';

const FilterDropdown = ({ label, options, value = '', onChange, allLabel = 'All' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = value
    ? options.find((o) => o.value === value)?.label || value
    : allLabel;

  const isSelected = !!value;

  return (
    <div className="relative" ref={ref}>
      {label && (
        <label className="block text-xs font-medium text-navy-500 mb-1.5">
          {label}
        </label>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={classNames(
          'flex items-center gap-2 min-w-[120px] sm:min-w-[150px] justify-between',
          'px-3 py-2.5 rounded-lg text-sm font-normal',
          'bg-white border transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400',
          isOpen
            ? 'border-primary-400 ring-2 ring-primary-500/30'
            : 'border-navy-200 hover:border-navy-300'
        )}
      >
        <span className={classNames('truncate', !isSelected && 'text-navy-400')}>
          {selectedLabel}
        </span>
        <svg
          className={classNames(
            'w-4 h-4 text-navy-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-navy-100 rounded-lg shadow-elevated max-h-60 overflow-auto">
          <button
            onClick={() => { onChange(''); setIsOpen(false); }}
            className={classNames(
              'w-full text-left px-3.5 py-2.5 text-sm transition-colors duration-100',
              'hover:bg-primary-50',
              !value
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-navy-700'
            )}
          >
            {allLabel}
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => { onChange(option.value); setIsOpen(false); }}
              className={classNames(
                'w-full text-left px-3.5 py-2.5 text-sm transition-colors duration-100',
                'hover:bg-primary-50',
                value === option.value
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-navy-700'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
