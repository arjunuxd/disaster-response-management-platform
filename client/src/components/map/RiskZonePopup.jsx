import { useAuth } from '../../context/AuthContext';

const RiskZonePopup = ({ zone, onEdit, onDelete }) => {
  const { isAdmin } = useAuth();

  const riskColor =
    zone.riskLevel === 'Critical'
      ? '#ef4444'
      : zone.riskLevel === 'High'
      ? '#f97316'
      : zone.riskLevel === 'Moderate'
      ? '#eab308'
      : '#22c55e';

  return (
    <div className="min-w-[240px] max-w-[300px]">
      <div className="flex items-center gap-1.5 mb-2">
        <span
          className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider"
          style={{ backgroundColor: riskColor }}
        >
          {zone.riskLevel}
        </span>
        <span className="text-[10px] text-gray-400 font-medium">Risk Zone</span>
      </div>
      <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-tight">
        {zone.zoneName}
      </h3>
      <p className="text-[11px] text-gray-500 mb-2">
        {zone.district}{zone.state ? `, ${zone.state}` : ''}
      </p>
      {zone.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-3 leading-relaxed">
          {zone.description}
        </p>
      )}
      <div className="text-[10px] text-gray-400 mb-2 font-mono">
        {zone.latitude.toFixed(5)}, {zone.longitude.toFixed(5)}
      </div>
      {isAdmin && (
        <div className="flex items-center gap-2 border-t border-gray-100 pt-2 mt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(zone);
            }}
            className="px-3 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(zone);
            }}
            className="px-3 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default RiskZonePopup;
