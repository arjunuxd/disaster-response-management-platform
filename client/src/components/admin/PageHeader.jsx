import { classNames } from '../../utils';

const PageHeader = ({ title, subtitle, action, onAction, children }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-navy-400 mt-1">{subtitle}</p>
        )}
      </div>
      {(action || children) && (
        <div className="flex items-center gap-3">
          {children}
          {action && (
            <button
              onClick={onAction}
              className={classNames(
                'btn-primary px-5 py-2.5 text-sm font-medium',
                'inline-flex items-center gap-2'
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {action}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
