import { classNames } from '../../utils';

const Loader = ({ size = 'md', className = '', text = '' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-[1.5px]',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
  };

  return (
    <div
      className={classNames('flex flex-col items-center justify-center gap-3', className)}
      role="status"
      aria-label={text || 'Loading'}
    >
      <div
        className={classNames(
          'border-primary-200 border-t-primary-600 rounded-full animate-spin',
          sizes[size]
        )}
      />
      {text && (
        <p className="text-sm font-medium text-navy-400">{text}</p>
      )}
    </div>
  );
};

export const PageLoader = ({ text = 'Loading...' }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader size="lg" text={text} />
  </div>
);

export const InlineLoader = () => (
  <div className="flex items-center justify-center py-12">
    <Loader size="md" text="Loading..." />
  </div>
);

export const SkeletonLine = ({ className = '' }) => (
  <div
    className={classNames(
      'rounded-md bg-navy-100 animate-pulse',
      className
    )}
  />
);

export const SkeletonCard = ({ lines = 3, className = '' }) => (
  <div className={classNames('space-y-3', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonLine
        key={i}
        className={classNames(
          'h-4',
          i === lines - 1 ? 'w-2/3' : 'w-full'
        )}
      />
    ))}
  </div>
);

export const SkeletonLoader = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={classNames('space-y-4', className)}>
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonLine key={i} className="h-4 w-full" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div
        key={rowIdx}
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, colIdx) => (
          <SkeletonLine
            key={colIdx}
            className={classNames(
              'h-4',
              colIdx === 0 ? 'w-3/4' : colIdx === columns - 1 ? 'w-1/2' : 'w-full'
            )}
          />
        ))}
      </div>
    ))}
  </div>
);

export default Loader;
