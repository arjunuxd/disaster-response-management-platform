const shimmer = 'animate-pulse bg-gray-200 rounded';

const Skeleton = ({ className = '' }) => (
  <div className={`${shimmer} ${className}`} aria-hidden="true" />
);

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <div className="flex items-center justify-between pt-2">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100">
      <Skeleton className="h-5 w-40" />
    </div>
    <div className="divide-y divide-gray-50">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-4 flex items-center gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className={`h-4 ${j === 0 ? 'w-8' : j === cols - 1 ? 'w-20' : 'flex-1'}`} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <div className="flex items-center justify-between mb-3">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="w-9 h-9 rounded-lg" />
    </div>
    <Skeleton className="h-8 w-16" />
  </div>
);

export const ListSkeleton = ({ items = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <Skeleton className="w-2 h-2 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full shrink-0" />
      </div>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <Skeleton className="h-5 w-40 mb-4" />
    <Skeleton className="h-48 w-full rounded-lg" />
  </div>
);

export default Skeleton;
