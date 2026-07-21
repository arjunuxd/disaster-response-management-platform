import { classNames } from '../../utils';

const colorMap = {
  primary: {
    bg: 'bg-primary-50',
    icon: 'text-primary-600',
    trend: 'text-primary-600',
  },
  success: {
    bg: 'bg-success-50',
    icon: 'text-success-600',
    trend: 'text-success-600',
  },
  warning: {
    bg: 'bg-warning-50',
    icon: 'text-warning-600',
    trend: 'text-warning-600',
  },
  danger: {
    bg: 'bg-danger-50',
    icon: 'text-danger-600',
    trend: 'text-danger-600',
  },
  navy: {
    bg: 'bg-navy-50',
    icon: 'text-navy-600',
    trend: 'text-navy-600',
  },
};

const StatsCard = ({ title, value, icon, color = 'primary', subtitle, trend }) => {
  const palette = colorMap[color] || colorMap.primary;

  return (
    <div className="card card-hover p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-navy-500 truncate">{title}</p>
          <p className="text-3xl font-bold text-navy-900 mt-2 tracking-tight">{value ?? 0}</p>
        </div>
        {icon && (
          <div
            className={classNames(
              'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ml-4',
              palette.bg
            )}
          >
            <span className={palette.icon}>{icon}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        {subtitle && (
          <p className="text-xs text-navy-400">{subtitle}</p>
        )}
        {trend != null && (
          <span
            className={classNames(
              'inline-flex items-center text-xs font-semibold',
              trend >= 0 ? 'text-success-600' : 'text-danger-600'
            )}
          >
            {trend >= 0 ? (
              <svg className="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 7l-9.2 9.2M7 7v10h10" />
              </svg>
            )}
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
