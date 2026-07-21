import { memo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { getDisasterIcon } from '../../utils/leafletIcon';
import ReportPopup from './ReportPopup';

const ReportMarkers = memo(({ reports, typeColorMap }) => {
  if (!reports || reports.length === 0) return null;

  return reports
    .filter((r) => r.latitude && r.longitude)
    .map((report) => {
      return (
        <Marker
          key={report._id}
          position={[report.latitude, report.longitude]}
          icon={getDisasterIcon(report.reportType?.name || report.reportType, typeColorMap)}
        >
          <Popup maxWidth={340} closeButton>
            <ReportPopup report={report} />
          </Popup>
        </Marker>
      );
    });
});

ReportMarkers.displayName = 'ReportMarkers';

export default ReportMarkers;
