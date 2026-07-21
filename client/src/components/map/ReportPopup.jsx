import { formatDate } from '../../utils';
import { SeverityBadge, StatusBadge } from '../ui/Badge';

const ReportPopup = ({ report }) => {
  return (
    <div className="min-w-[260px] max-w-[320px]">
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
          {report.reportType?.name || report.reportType}
        </span>
        <SeverityBadge severity={report.severity} />
        <StatusBadge status={report.status} />
      </div>
      <h3 className="font-semibold text-gray-900 text-sm mb-1.5 leading-tight">
        {report.title}
      </h3>
      <p className="text-[11px] text-gray-500 mb-2">
        {report.district}{report.state ? `, ${report.state}` : ''}
      </p>
      <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">
        {report.description}
      </p>
      {report.images && report.images.length > 0 && (
        <div className="mb-2 flex gap-1.5 overflow-x-auto">
          {report.images.slice(0, 3).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt=""
              className="w-16 h-16 object-cover rounded-md border border-gray-200 flex-shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ))}
          {report.images.length > 3 && (
            <div className="w-16 h-16 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-medium text-gray-500">+{report.images.length - 3}</span>
            </div>
          )}
        </div>
      )}
      <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-1">
        <span className="text-[10px] text-gray-400">
          {formatDate(report.createdAt)}
        </span>
        <a
          href={`/reports/${report._id}`}
          className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
        >
          Details
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default ReportPopup;
