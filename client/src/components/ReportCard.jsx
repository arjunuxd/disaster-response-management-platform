import { Link } from 'react-router-dom';
import { SeverityBadge, StatusBadge } from './ui/Badge';
import { formatDate, truncateText } from '../utils';

const ReportCard = ({ report }) => {
  return (
    <Link
      to={`/reports/${report._id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
            {report.reportType?.name || report.reportType}
          </span>
          <SeverityBadge severity={report.severity} />
        </div>
        <StatusBadge status={report.status} />
      </div>

      <h3 className="text-gray-900 font-semibold group-hover:text-primary-600 transition-colors mb-1 line-clamp-2">
        {report.title}
      </h3>
      <p className="text-sm text-gray-500 mb-3">
        {truncateText(report.description, 120)}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-400 gap-2">
        <div className="flex items-center gap-3 min-w-0 overflow-hidden">
          {report.district && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {report.district}, {report.state}
            </span>
          )}
          {report.reportedBy?.fullName && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {report.reportedBy.fullName}
            </span>
          )}
        </div>
        <span className="shrink-0">{formatDate(report.createdAt)}</span>
      </div>
    </Link>
  );
};

export default ReportCard;
